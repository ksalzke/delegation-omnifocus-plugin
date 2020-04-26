(() => {
  var delegationLib = new PlugIn.Library(new Version("1.0"));

  delegationLib.followUp = (selectedTasks) => {
    config = PlugIn.find("com.KaitlinSalzke.Delegation").library(
      "delegationConfig"
    );

    // configure tags
    waitingTag = config.waitingTag();
    followUpMethods = config.followUpMethods();
    defaultFollowUpMethod = config.defaultFollowUpMethod();

    // uninherited tags to be removed
    uninheritedTags = config.uninheritedTags();

    // also remove tags that are children of waiting tag
    uninheritedTags = uninheritedTags.concat(waitingTag.children, waitingTag);

    functionLibrary = PlugIn.find("com.KaitlinSalzke.functionLibrary").library(
      "functionLibrary"
    );

    function addFollowUpTask(taskArray, contactMethod) {
      taskArray.forEach((task) => {
        // get parent task
        parentTask = functionLibrary.getParent(task);

        if (!/^Waiting for: /.test(parentTask.name)) {
          // add parent action group
          parentTask = new Task(task.name, task.before);
        }

        // move original task inside group
        moveTasks([task], parentTask.ending);

        // replace "Waiting for: " with "Follow up: " in task name
        followUpTaskName = task.name.replace(
          /^(?:Waiting for: )*/,
          "Follow up: "
        );

        // create task and add relevant tags and link to original task
        followUpTask = new Task(followUpTaskName, task.before);
        followUpTask.addTag(contactMethod);
        followUpTask.addTags(task.tags);
        followUpTask.removeTags(uninheritedTags);
        followUpTask.note =
          "[FOLLOWUPON: omnifocus:///task/" + task.id.primaryKey + "]";

        // make the group sequential
        parentTask.sequential = true;
      });
    }

    if (followUpMethods.length > 1) {
      // show form to select follow up method
      var inputForm = new Form();
      popupMenu = new Form.Field.Option(
        "contactMethod",
        "Contact Method",
        followUpMethods,
        followUpMethods.map((tag) => tag.name),
        defaultFollowUpMethod
      );

      inputForm.addField(popupMenu);

      formPrompt = "Select contact method:";
      formPromise = inputForm.show(formPrompt, "Continue");

      inputForm.validate = function (formObject) {
        validation = true;
        return validation;
      };

      // process results from form selection
      formPromise.then(function (formObject) {
        selectedFollowUpMethod = formObject.values["contactMethod"];
        addFollowUpTask(selectedTasks, formObject.values["contactMethod"]);
      });
    } else {
      addFollowUpTask(selectedTasks, defaultFollowUpMethod);
    }

    // log error if form is cancelled
    formPromise.catch(function (err) {
      console.log("form cancelled", err.message);
    });
  };

  delegationLib.noteFollowUp = (task) => {
    functionLibrary = PlugIn.find("com.KaitlinSalzke.functionLibrary").library(
      "functionLibrary"
    );

    // if 'Follow up' task, make a note on original task when followed up on
    if (/[fF]ollow up/.test(task.name)) {
      originalTaskRegex = /\[FOLLOWUPON: omnifocus:\/\/\/task\/(.+)\]/g;
      originalTaskRegexResult = originalTaskRegex.exec(task.note);

      if (originalTaskRegexResult !== null) {
        originalTaskId = originalTaskRegexResult[1];
        originalTask = functionLibrary.getTaskWithId(originalTaskId);

        now = new Date();

        originalTask.note = `${
          originalTask.note
        }\n\nFollowed up ${now.toString()}`;
      }
    }
  };

  delegationLib.followUpDueToday = () => {
    // configuration
    config = PlugIn.find("com.KaitlinSalzke.Delegation").library(
      "delegationConfig"
    );
    waitingTag = config.waitingTag();

    today = Calendar.current.startOfDay(new Date());

    dueToday = [];
    waitingTag.remainingTasks.forEach((task) => {
      if (
        task.effectiveDueDate !== null &&
        Calendar.current.startOfDay(task.effectiveDueDate).getTime() ===
          today.getTime()
      ) {
        dueToday.push(task);
      }
    });

    if (dueToday.length > 0) {
      delegationLib.followUp(dueToday);
    }
  };

  return delegationLib;
})();
