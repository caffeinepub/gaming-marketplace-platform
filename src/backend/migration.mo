import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Storage "blob-storage/Storage";

module {
  type UserProfile = {
    name : Text;
    email : Text;
    username : ?Text;
  };

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

  type CartItem = {
    productId : Text;
    quantity : Nat;
  };

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
    user : Principal.Principal;
    timestamp : Int;
    transactionId : Text;
    giftCardType : GiftCardType;
    giftCardCode : ?Text;
    status : QueueSkipStatus;
  };

  // OLD
  type OldPaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
    instagramUrl : Text;
    queueSkipPriceGBP : Float;
  };

  type OldActor = {
    forbiddenWords : [Text];
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    usernameMap : Map.Map<Text, Principal.Principal>;
    products : Map.Map<Text, Product>;
    categories : Map.Map<Text, Category>;
    paymentConfig : OldPaymentConfig;
    carts : Map.Map<Principal.Principal, [CartItem]>;
    queueSkipSubmissions : Map.Map<Principal.Principal, QueueSkipSubmission>;
    queueBypassUsers : Map.Map<Principal.Principal, Bool>;
    fraudulentUsers : Map.Map<Principal.Principal, Bool>;
  };

  // NEW
  type PaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
    instagramUrl : Text;
    queueSkipPriceGBP : Float;
    usernameRegenerationPriceGBP : Float;
  };

  type NewActor = {
    forbiddenWords : [Text];
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    usernameMap : Map.Map<Text, Principal.Principal>;
    products : Map.Map<Text, Product>;
    categories : Map.Map<Text, Category>;
    paymentConfig : PaymentConfig;
    carts : Map.Map<Principal.Principal, [CartItem]>;
    queueSkipSubmissions : Map.Map<Principal.Principal, QueueSkipSubmission>;
    queueBypassUsers : Map.Map<Principal.Principal, Bool>;
    fraudulentUsers : Map.Map<Principal.Principal, Bool>;
  };

  public func run(old : OldActor) : NewActor {
    let newPaymentConfig = {
      old.paymentConfig with
      usernameRegenerationPriceGBP = 0.01;
    };
    {
      old with paymentConfig = newPaymentConfig;
    };
  };
};
