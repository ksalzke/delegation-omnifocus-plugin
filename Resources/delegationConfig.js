var _ = (function() {
	var delegationConfig = new PlugIn.Library(new Version("1.0"));

	delegationConfig.followUpTag = () => {
		// edit the below line to configure the tag used to mark
		// each task that is created as a 'follow up' action
		// THIS SHOULD BE A TAG OBJECT
		return tagNamed("Activity Type").tagNamed("Contact");
	};

	delegationConfig.waitingTag = () => {
		// edit the below line to configure the tag used to mark
		// tasks as waiting
		// THIS SHOULD BE A TAG OBJECT
		return tagNamed("Activity Type").tagNamed("⏳ Waiting");
	};

	delegationConfig.followUpMethods = () => {
		// edit the below line to configure the list of tags used
		// to mark different communication methods (i.e. means of follow-up)
		// THIS SHOULD BE AN ARRAY OF TAG OBJECTS
		return delegationConfig.followUpTag().children;
	};

	delegationConfig.defaultFollowUpMethod = () => {
		// edit the below line to configure the default contact
		// method that should be selected in the form
		// THIS SHOULD BE A TAG OBJECT THAT IS INCLUDED IN THE
		// FOLLOW UP METHODS ABOVE
		return tagNamed("Activity Type")
			.tagNamed("Contact")
			.tagNamed("📧 Email");
	};

	return delegationConfig;
})();
_;
