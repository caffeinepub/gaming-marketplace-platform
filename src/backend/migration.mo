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
    let newWhitelist = old.adminUsernameWhitelist.clone();

    newWhitelist.add("venomgladiator25", true);
    newWhitelist.add("turbohunter64", true);

    {
      adminUsernameWhitelist = newWhitelist;
      // All other state stays the same
    };
  };
};
