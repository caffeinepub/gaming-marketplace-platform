import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldPaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
      username : ?Text;
    }>;
    usernameMap : Map.Map<Text, Principal>;
    products : Map.Map<Text, {
      id : Text;
      name : Text;
      productType : { #account; #currency; #clothes };
      priceGBP : Float;
      imageUrls : [Text];
      quantityAvailable : Nat;
      gameCategory : Text;
      description : Text;
      image : Storage.ExternalBlob;
    }>;
    categories : Map.Map<Text, {
      name : Text;
      description : Text;
    }>;
    paymentConfig : OldPaymentConfig;
    carts : Map.Map<Principal, [{ productId : Text; quantity : Nat }]>;
  };

  type NewPaymentConfig = {
    paypalEmail : Text;
    ukGiftCardInstructions : Text;
    cryptoWalletAddress : Text;
    instagramUrl : Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, {
      name : Text;
      email : Text;
      username : ?Text;
    }>;
    usernameMap : Map.Map<Text, Principal>;
    products : Map.Map<Text, {
      id : Text;
      name : Text;
      productType : { #account; #currency; #clothes };
      priceGBP : Float;
      imageUrls : [Text];
      quantityAvailable : Nat;
      gameCategory : Text;
      description : Text;
      image : Storage.ExternalBlob;
    }>;
    categories : Map.Map<Text, {
      name : Text;
      description : Text;
    }>;
    paymentConfig : NewPaymentConfig;
    carts : Map.Map<Principal, [{ productId : Text; quantity : Nat }]>;
  };

  public func run(old : OldActor) : NewActor {
    let newPaymentConfig : NewPaymentConfig = {
      old.paymentConfig with
      instagramUrl = "";
    };
    { old with paymentConfig = newPaymentConfig };
  };
};
