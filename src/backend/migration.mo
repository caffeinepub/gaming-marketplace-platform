import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    userId : Text;
    name : Text;
    email : Text;
    username : ?Text;
    phoneNumber : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userIdSet : Map.Map<Text, Bool>;
    usernameMap : Map.Map<Text, Principal>;
    customUsernames : Map.Map<Principal, Text>;
    phoneNumberMap : Map.Map<Text, Principal>;
    adminPhoneWhitelist : Map.Map<Text, Bool>;
  };

  type NewUserProfile = {
    userId : Text;
    name : Text;
    email : Text;
    username : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    userIdSet : Map.Map<Text, Bool>;
    usernameMap : Map.Map<Text, Principal>;
    customUsernames : Map.Map<Principal, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          userId = oldProfile.userId;
          name = oldProfile.name;
          email = oldProfile.email;
          username = oldProfile.username;
        };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
