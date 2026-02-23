import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Random "mo:core/Random";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let forbiddenWords = [
    "swearword1",
    "swearword2",
    "swearword3",
    "badword",
    "offensive",
    "rude",
  ];

  public type UserProfile = {
    userId : Text;
    name : Text;
    email : Text;
    username : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userIdSet = Map.empty<Text, Bool>();
  let usernameMap = Map.empty<Text, Principal>();
  let customUsernames = Map.empty<Principal, Text>();

  type Product = {
    id : Text;
    name : Text;
    productType : ProductType;
    priceGBP : Float;
    imageUrls : [Text];
    quantityAvailable : Nat;
    gameCategory : Text;
    description : Text;
    image : Storage.ExternalBlob;
  };

  type ProductType = { #account; #currency; #clothes };

  type Category = {
    name : Text;
    description : Text;
  };

  let products = Map.empty<Text, Product>();
  let categories = Map.empty<Text, Category>();

  type PaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
    instagramUrl : Text;
    queueSkipPriceGBP : Float;
    usernameRegenerationPriceGBP : Float;
    customUsernamePriceGBP : Float;
  };

  var paymentConfig : PaymentConfig = {
    paypalEmail = "";
    ukGiftCardInstructions = "";
    cryptoWalletAddress = "";
    instagramUrl = "";
    queueSkipPriceGBP = 0.05;
    usernameRegenerationPriceGBP = 0.01;
    customUsernamePriceGBP = 0.10;
  };

  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, [CartItem]>();

  type QueueSkipStatus = {
    #pendingReview;
    #approved;
    #flaggedFraudulent;
  };

  type GiftCardType = {
    #amazon;
    #starbucks;
    #tesco;
    #cryptocurrency;
    #other;
  };

  type QueueSkipSubmission = {
    user : Principal;
    timestamp : Time.Time;
    transactionId : Text;
    giftCardType : GiftCardType;
    giftCardCode : ?Text;
    status : QueueSkipStatus;
  };

  let queueSkipSubmissions = Map.empty<Principal, QueueSkipSubmission>();
  let queueBypassUsers = Map.empty<Principal, Bool>();
  let fraudulentUsers = Map.empty<Principal, Bool>();

  type CustomUsernameStatus = {
    #pendingReview;
    #approved;
    #rejected;
  };

  type PaymentMethod = {
    #paypal;
    #giftCard;
    #crypto;
  };

  type CustomUsernameSubmission = {
    user : Principal;
    timestamp : Time.Time;
    requestedUsername : Text;
    paymentMethod : PaymentMethod;
    transactionDetails : Text;
    status : CustomUsernameStatus;
  };

  let customUsernameSubmissions = Map.empty<Principal, CustomUsernameSubmission>();

  let adminUsernameWhitelist = Map.empty<Text, Bool>();

  do {
    adminUsernameWhitelist.add("venomgladiator25", true);
    adminUsernameWhitelist.add("turbohunter64", true);
  };

  func generateUniqueShortID() : async Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charsArray = chars.toArray();
    var userId = "";
    var attempts = 0;
    let maxAttempts = 100;

    label generation loop {
      if (attempts >= maxAttempts) {
        Runtime.trap("Failed to generate unique short ID after maximum attempts");
      };

      userId := "";
      let randomBytes = await Random.blob();
      let byteArray = randomBytes.toArray();

      var i = 0;
      while (i < 6) {
        let index = byteArray[i % byteArray.size()].toNat() % charsArray.size();
        userId := userId # charsArray[index].toText();
        i += 1;
      };

      if (not userIdSet.containsKey(userId)) {
        break generation;
      };

      attempts += 1;
    };

    userIdSet.add(userId, true);
    userId;
  };

  public shared ({ caller }) func addAdminUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add admin usernames");
    };
    adminUsernameWhitelist.add(username, true);
  };

  public shared ({ caller }) func removeAdminUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove admin usernames");
    };
    adminUsernameWhitelist.remove(username);
  };

  public query func isAdminUsername(username : Text) : async Bool {
    switch (adminUsernameWhitelist.get(username)) {
      case (null) { false };
      case (?exists) { exists };
    };
  };

  public query({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    getUserProfileWithCustomUsername(caller);
  };

  public query({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getUserProfileWithCustomUsername(user);
  };

  public shared({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let finalProfile = switch (userProfiles.get(caller)) {
      case (null) {
        let newShortId = await generateUniqueShortID();
        {
          profile with
          userId = newShortId;
        };
      };
      case (?existingProfile) {
        {
          profile with
          userId = existingProfile.userId;
        };
      };
    };

    userProfiles.add(caller, finalProfile);
  };

  public shared({ caller }) func createUsername(requestedUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create usernames");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile must exist before creating username") };
      case (?profile) {
        switch (profile.username) {
          case (?_) { Runtime.trap("Username already exists for this user") };
          case (null) {};
        };
      };
    };

    createOrValidateUsername(caller, requestedUsername, false);
  };

  public shared({ caller }) func validateGeneratedUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate usernames");
    };
    validateUsername(username);
  };

  func validateUsername(username : Text) {
    if (username.size() < 5) {
      Runtime.trap("Username must be at least 5 characters long");
    };

    let isValidAlphanumeric = username.toArray().all(
      func(char) { char.isDigit() or (char >= 'a' and char <= 'z') }
    );
    if (not isValidAlphanumeric) {
      Runtime.trap("Username must only contain lowercase letters and numbers");
    };

    let lowerUsername = username.toLower();
    if (forbiddenWords.any(func(word) { lowerUsername.contains(#text word) })) {
      Runtime.trap("Username contains forbidden words");
    };
  };

  func createOrValidateUsername(caller : Principal, username : Text, isCustom : Bool) {
    validateUsername(username);

    if (usernameMap.containsKey(username)) {
      Runtime.trap("Username already taken - bombsawayYYYYYY️️️");
    };

    if (not isCustom) {
      switch (userProfiles.get(caller)) {
        case (null) { Runtime.trap("Profile must exist in order to update it - bombsawayYYYYYY️️️") };
        case (?profile) {
          let updatedProfile : UserProfile = {
            profile with
            username = ?username;
          };
          userProfiles.add(caller, updatedProfile);
          usernameMap.add(username, caller);
        };
      };
    };
  };

  func getUserProfileWithCustomUsername(user : Principal) : ?UserProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        let finalUsername = switch (customUsernames.get(user)) {
          case (null) { profile.username };
          case (?_custom) { ?_custom };
        };
        ?{
          profile with
          username = finalUsername;
        };
      };
    };
  };

  public query({ caller }) func hasUsername() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check username status");
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.username) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  public query({ caller }) func getUsername(_user : Principal) : async ?Text {
    if (caller != _user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own username");
    };
    switch (userProfiles.get(_user)) {
      case (null) { Runtime.trap("User does not exist - bombsawayYYYYYY️️️") };
      case (?profile) { profile.username };
    };
  };

  public shared({ caller }) func submitCustomUsername(
    requestedUsername : Text,
    paymentMethod : PaymentMethod,
    transactionDetails : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit custom username requests");
    };

    createOrValidateUsername(caller, requestedUsername, true);

    let submission : CustomUsernameSubmission = {
      user = caller;
      timestamp = Time.now();
      requestedUsername;
      paymentMethod;
      transactionDetails;
      status = #pendingReview;
    };

    customUsernameSubmissions.add(caller, submission);
  };

  public shared({ caller }) func approveCustomUsername(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve custom usernames");
    };

    switch (customUsernameSubmissions.get(user)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        let updatedSubmission = { submission with status = #approved };
        customUsernameSubmissions.add(user, updatedSubmission);

        customUsernames.add(user, submission.requestedUsername);
        usernameMap.add(submission.requestedUsername, user);
      };
    };
  };

  public shared({ caller }) func rejectCustomUsername(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject custom usernames");
    };

    switch (customUsernameSubmissions.get(user)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        let updatedSubmission = { submission with status = #rejected };
        customUsernameSubmissions.add(user, updatedSubmission);
      };
    };
  };

  public query({ caller }) func getCustomUsernameSubmissions() : async [CustomUsernameSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view custom username submissions");
    };
    customUsernameSubmissions.values().toArray();
  };

  public shared({ caller }) func createProduct(id : Text, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    switch (products.get(id)) {
      case (?_) { Runtime.trap("Product with ID already exists") };
      case (null) {
        products.add(id, product);
      };
    };
  };

  public shared({ caller }) func updateProduct(id : Text, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.add(id, updatedProduct) };
    };
  };

  public shared({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public query func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public shared({ caller }) func createCategory(name : Text, category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    if (categories.containsKey(name)) {
      Runtime.trap("Category already exists");
    };
    categories.add(name, category);
  };

  public shared({ caller }) func updateCategory(name : Text, updatedCategory : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categories.add(name, updatedCategory) };
    };
  };

  public shared({ caller }) func deleteCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(name)) {
      Runtime.trap("Category not found");
    };
    categories.remove(name);
  };

  public query func getCategory(name : Text) : async Category {
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public query func getAllCategories() : async [Category] {
    categories.values().toArray();
  };

  public shared({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        if (quantity > product.quantityAvailable) {
          Runtime.trap("Requested quantity exceeds available stock");
        };
      };
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    let productInCart = currentCart.find(func(item) { item.productId == productId });

    let finalCart = switch (productInCart) {
      case (null) {
        currentCart.concat([{
          productId;
          quantity;
        }]);
      };
      case (?_) {
        currentCart.map(
          func(item) {
            if (item.productId == productId) {
              { productId = item.productId; quantity = item.quantity + quantity };
            } else {
              item;
            };
          }
        );
      };
    };

    carts.add(caller, finalCart);
  };

  public query({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared({ caller }) func updateCartItemQuantity(productId : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (quantity == 0) {
      let updatedCart = currentCart.filter(func(item) { item.productId != productId });
      carts.add(caller, updatedCart);
    } else {
      let updatedCart = currentCart.map(
        func(item) {
          if (item.productId == productId) {
            { productId = item.productId; quantity = quantity };
          } else {
            item;
          };
        }
      );
      carts.add(caller, updatedCart);
    };
  };

  public shared({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    carts.add(caller, []);
  };

  public shared({ caller }) func updatePaymentDetails(config : PaymentConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment details");
    };
    paymentConfig := config;
  };

  public query({ caller }) func getPaymentDetails() : async PaymentConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment details");
    };
    paymentConfig;
  };

  public query func getInstagramUrl() : async Text {
    paymentConfig.instagramUrl;
  };

  public shared({ caller }) func submitQueueSkipPayment(
    transactionId : Text,
    giftCardType : GiftCardType,
    giftCardCode : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit queue skip payments");
    };

    switch (fraudulentUsers.get(caller)) {
      case (?true) {
        Runtime.trap("Unauthorized: You have been flagged for fraudulent activity and cannot use the queue skip feature");
      };
      case (_) {};
    };

    let submission : QueueSkipSubmission = {
      user = caller;
      timestamp = Time.now();
      transactionId;
      giftCardType;
      giftCardCode;
      status = #pendingReview;
    };

    queueSkipSubmissions.add(caller, submission);
    queueBypassUsers.add(caller, true);

    ();
  };

  public query({ caller }) func hasQueueBypass() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check queue bypass status");
    };
    switch (queueBypassUsers.get(caller)) {
      case (null) { false };
      case (?status) { status };
    };
  };

  public query({ caller }) func getQueueSkipSubmissions() : async [QueueSkipSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view queue skip submissions");
    };
    queueSkipSubmissions.values().toArray();
  };

  public shared({ caller }) func flagQueueSkipFraud(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can flag submissions");
    };

    switch (queueSkipSubmissions.get(user)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        let updatedSubmission = { submission with status = #flaggedFraudulent };
        queueSkipSubmissions.add(user, updatedSubmission);
        queueBypassUsers.remove(user);
        fraudulentUsers.add(user, true);
      };
    };
  };

  type ExtendedQueueSkipSubmission = {
    submission : QueueSkipSubmission;
    username : ?Text;
  };

  public query({ caller }) func getQueueSkipSubmissionsWithUsernames() : async [ExtendedQueueSkipSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view queue skip submissions");
    };

    let mappedValues = queueSkipSubmissions.values().map<QueueSkipSubmission, ExtendedQueueSkipSubmission>(
      func(sub : QueueSkipSubmission) {
        let username = getUsernameForUser(sub.user);
        {
          submission = sub;
          username;
        };
      }
    );
    mappedValues.toArray();
  };

  func getUsernameForUser(user : Principal) : ?Text {
    switch (customUsernames.get(user)) {
      case (?custom) { ?custom };
      case (null) {
        switch (userProfiles.get(user)) {
          case (?profile) { profile.username };
          case (null) { null };
        };
      };
    };
  };
};

