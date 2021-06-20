(() => {
  var delegationConfig = new PlugIn.Library(new Version("1.0"));

  delegationConfig.waitingTag = () => {
    // edit the below line to configure the tag used to mark
    // tasks as waiting
    // THIS SHOULD BE A TAG OBJECT
    return tagsMatching("⏳ Waiting")[0];
  };

  delegationConfig.followUpMethods = () => {
    // edit the below line to configure the list of tags used
    // to mark different communication methods (i.e. means of follow-up)
    // THIS SHOULD BE AN ARRAY OF TAG OBJECTS
    return tagsMatching("Contact")[0].children;
  };

  delegationConfig.defaultFollowUpMethod = () => {
    // edit the below line to configure the default contact
    // method that should be selected in the form
    // THIS SHOULD BE A TAG OBJECT THAT IS INCLUDED IN THE
    // FOLLOW UP METHODS ABOVE
    return tagsMatching("📧 Email")[0];
  };

  delegationConfig.uninheritedTags = () => {
    // edit the below line to configure the list of tags that
    // will NOT be inherited by 'follow up' or 'waiting' tasks
    // THIS SHOULD BE AN ARRAY OF TAG OBJECTS
    return [];
  };

  delegationConfig.functionsForOriginalTaskBeforeWaiting = () => {
    // edit the below to configure the function(s) that will be
    // run on the original task before the 'waiting' task is created,
    // including the action to complete the original task
    // THIS SHOULD BE AN ARRAY OF FUNCTIONS
    customCompletePlugin = PlugIn.find("com.KaitlinSalzke.customComplete");
    if (customCompletePlugin !== null) {
      return [customCompletePlugin.library("customCompleteLib").customComplete];
    } else {
      basicCompleteFunction = (task) => {
        task.markComplete();
      };
      return [basicCompleteFunction];
    }
  };

  delegationConfig.showForm = () => {
    // edit the below to configure whether a form is shown
    // to edit the 'waiting for' task
    // THIS SHOULD BE EITHER TRUE OR FALSE
    return true;
  };

  delegationConfig.defaultDeferDays = () => {
    // edit the below to configure the number of days
    // the 'waiting' task is deferred by default
    // THIS SHOULD BE A NUMBER, OR NULL IF NO DEFER DATE IS DESIRED
    return null;
  };

  delegationConfig.replacements = () => {
    // edit the below to configure the text that is used to
    // 'replace' the original task when the 'waiting for' action is run
    // THIS SHOULD BE AN ARRAY OF 2-ITEM ARRAYS; IN EACH ARRAY,
    // THE FIRST ITEM SHOULD BE A STRING OR REGULAR EXPRESSION
    // AND THE SECOND A STRING (WHICH MAY CONTAIN REPLACEMENT PATTERNS)
    return [
      [/Call (.+) re (.+)/, "Waiting for: $1 to return phone call re $2"],
      [/Email (.+) re (.+)/, "Waiting for: $1 to reply to email re $2"],
    ];
  };

  return delegationConfig;
})();
