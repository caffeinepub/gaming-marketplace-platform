import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Nat32 "mo:core/Nat32";
import Float "mo:core/Float";

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
    name : Text;
    email : Text;
    username : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernameMap = Map.empty<Text, Principal>();

  // Product Models & Categories
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

  // Payment Configurations
  type PaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
    instagramUrl : Text;
    queueSkipPriceGBP : Float;
    usernameRegenerationPriceGBP : Float; // New price field (0.01)
  };

  var paymentConfig : PaymentConfig = {
    paypalEmail = "";
    ukGiftCardInstructions = "";
    cryptoWalletAddress = "";
    instagramUrl = "";
    queueSkipPriceGBP = 0.05;
    usernameRegenerationPriceGBP = 0.01; // Default value
  };

  // Shopping Cart
  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

  let carts = Map.empty<Principal, [CartItem]>();

  // Queue Skip Bypass Types
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

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUsername(requestedUsername : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create usernames");
    };

    if (requestedUsername.size() < 5) {
      Runtime.trap("Username must be at least 5 characters long");
    };

    let isValidAlphanumeric = requestedUsername.toArray().all(
      func(char) {
        char.isDigit() or (char >= 'a' and char <= 'z');
      }
    );
    if (not isValidAlphanumeric) {
      Runtime.trap("Username must only contain lowercase letters and numbers");
    };

    let lowerUsername = requestedUsername.toLower();
    if (forbiddenWords.any(func(word) { lowerUsername.contains(#text word) })) {
      Runtime.trap("Username contains forbidden words");
    };

    if (usernameMap.containsKey(requestedUsername)) {
      Runtime.trap("Username already taken - bombsawayYYYYYY️️️");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile must exist in order to update it - bombsawayYYYYYY️️️") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with
          username = ?requestedUsername;
        };
        userProfiles.add(caller, updatedProfile);
        usernameMap.add(requestedUsername, caller);
      };
    };
  };

  // Validate generated username externally (open AI is on frontend)
  public shared ({ caller }) func validateGeneratedUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate usernames");
    };

    let isValidAlphanumeric = username.toArray().all(
      func(char) {
        char.isDigit() or (char >= 'a' and char <= 'z');
      }
    );
    if (not isValidAlphanumeric) {
      Runtime.trap("Username must only contain lowercase letters and numbers");
    };

    let lowerUsername = username.toLower();
    if (forbiddenWords.any(func(word) { lowerUsername.contains(#text word) })) {
      Runtime.trap("Username contains forbidden words");
    };
  };

  public query ({ caller }) func hasUsername() : async Bool {
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

  public query ({ caller }) func getUsername(_user : Principal) : async ?Text {
    if (caller != _user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own username");
    };
    switch (userProfiles.get(_user)) {
      case (null) { Runtime.trap("User does not exist - bombsawayYYYYYY️️️"); };
      case (?profile) { profile.username };
    };
  };

  // Product Management (Admin Only)
  public shared ({ caller }) func createProduct(id : Text, product : Product) : async () {
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

  public shared ({ caller }) func updateProduct(id : Text, updatedProduct : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.add(id, updatedProduct) };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public query ({ caller }) func getProduct(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Category Management (Admin Only)
  public shared ({ caller }) func createCategory(name : Text, category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    if (categories.containsKey(name)) {
      Runtime.trap("Category already exists");
    };
    categories.add(name, category);
  };

  public shared ({ caller }) func updateCategory(name : Text, updatedCategory : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?_) { categories.add(name, updatedCategory) };
    };
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(name)) {
      Runtime.trap("Category not found");
    };
    categories.remove(name);
  };

  public query ({ caller }) func getCategory(name : Text) : async Category {
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category not found") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories.values().toArray();
  };

  // Cart Functionality (User Only)
  public shared ({ caller }) func addToCart(productId : Text, quantity : Nat) : async () {
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

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func updateCartItemQuantity(productId : Text, quantity : Nat) : async () {
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

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    carts.add(caller, []);
  };

  // Payment Integration (Admin Only for updates, authenticated users for viewing)
  public shared ({ caller }) func updatePaymentDetails(config : PaymentConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update payment details");
    };
    paymentConfig := config;
  };

  public query ({ caller }) func getPaymentDetails() : async PaymentConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payment details");
    };
    paymentConfig;
  };

  public query ({ caller }) func getInstagramUrl() : async Text {
    paymentConfig.instagramUrl;
  };

  // Queue Skip Feature (updated)
  public shared ({ caller }) func submitQueueSkipPayment(
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

    () // Immediately grant queue bypass
  };

  public query ({ caller }) func hasQueueBypass() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check queue bypass status");
    };
    switch (queueBypassUsers.get(caller)) {
      case (null) { false };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getQueueSkipSubmissions() : async [QueueSkipSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view queue skip submissions");
    };
    queueSkipSubmissions.values().toArray();
  };

  public shared ({ caller }) func flagQueueSkipFraud(user : Principal) : async () {
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
};
