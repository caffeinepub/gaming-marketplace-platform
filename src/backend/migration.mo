import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type OldActor = {
    adminUsernameWhitelist : Map.Map<Text, Bool>;
  };

  type NewActor = {
    adminUsernameWhitelist : Map.Map<Text, Bool>;
  };

  public func run(old : OldActor) : NewActor {
    let updatedWhitelist = old.adminUsernameWhitelist.clone();
    updatedWhitelist.add("venomgladiator25", true);
    { old with adminUsernameWhitelist = updatedWhitelist };
  };
};
