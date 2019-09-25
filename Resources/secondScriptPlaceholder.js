var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {});

	action.validate = function(selection, sender) {
		return false;
	};

	return action;
})();
_;
