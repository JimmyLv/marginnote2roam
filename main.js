JSB.newAddon = function (mainPath) {
  JSB.require("SampleViewControllerW");
  var newAddonClass = JSB.defineClass(
    "RoamAddon : JSExtension",
    /*Instance members*/ {
      //Window initialize
      sceneWillConnect: function () {
        self.layoutViewController = function () {
          var frame = Application.sharedInstance().studyController(self.window)
            .view.bounds;

          if (self.webController.positon == "lt")
            self.webController.view.frame = {
              x: 45,
              y: 70,
              width: 375,
              height: 480,
            };
          else if (self.webController.positon == "rt")
            self.webController.view.frame = {
              x: frame.width - 420,
              y: 70,
              width: 375,
              height: 480,
            };
          else if (self.webController.positon == "ct")
            self.webController.view.frame = {
              x: (frame.width - 375) / 2,
              y: (frame.height - 480) / 2,
              width: 375,
              height: 480,
            };
          else if (self.webController.positon == "lb")
            self.webController.view.frame = {
              x: 0,
              y: frame.height - 480,
              width: 375,
              height: 480,
            };
          else if (self.webController.positon == "rb")
            self.webController.view.frame = {
              x: frame.width - 375,
              y: frame.height - 480,
              width: 375,
              height: 480,
            };
        };
        self.webController = SampleViewControllerW.new();
        self.webController.mainPath = mainPath;
      },
      //Window disconnect
      sceneDidDisconnect: function () {},
      //Window resign active
      sceneWillResignActive: function () {},
      //Window become active
      sceneDidBecomeActive: function () {},
      notebookWillOpen: function (notebookid) {
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          "onPopupMenuOnNote:",
          "PopupMenuOnNote"
        );
        NSNotificationCenter.defaultCenter().addObserverSelectorName(
          self,
          "onPopupMenuOnSelection:",
          "PopupMenuOnSelection"
        );
        NSTimer.scheduledTimerWithTimeInterval(0.2, false, function () {
          var sample_on = NSUserDefaults.standardUserDefaults().objectForKey(
            "marginnote_deel_on"
          );
          if (sample_on == true) {
            Application.sharedInstance()
              .studyController(self.window)
              .view.addSubview(self.webController.view);
            self.layoutViewController();
            Application.sharedInstance()
              .studyController(self.window)
              .refreshAddonCommands();
          }
        });
      },
      notebookWillClose: function (notebookid) {
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          "onPopupMenuOnNote"
        );
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          "onPopupMenuOnSelection"
        );
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          "ProcessNewExcerpt"
        );
        NSNotificationCenter.defaultCenter().removeObserverName(
          self,
          "ChangeExcerptRange"
        );
      },
      documentDidOpen: function (docmd5) {},
      documentWillClose: function (docmd5) {},
      controllerWillLayoutSubviews: function (controller) {
        //在这里添加窗口位置布局的代码
        if (
          controller ==
          Application.sharedInstance().studyController(self.window)
        ) {
          self.layoutViewController();
        }
      },
      queryAddonCommandStatus: function () {
        return {
          image: "roam.png",
          object: self,
          selector: "toggleSample:",
          checked: self.webController.view.window ? true : false,
        };
      },

      onPopupMenuOnSelection: function (sender) {
        if (
          !Application.sharedInstance().checkNotifySenderInWindow(
            sender,
            self.window
          )
        )
          return; //Don't process message from other window
        if (!self.webController.view.window) return;

        var text = sender.userInfo.documentController.selectionText;
        if (text && text.length) {
          self.webController.saveText(text);
        }
      },
      onPopupMenuOnNote: function (sender) {
        if (
          !Application.sharedInstance().checkNotifySenderInWindow(
            sender,
            self.window
          )
        )
          return; //Don't process message from other window
        if (!self.webController.view.window) return;
        var text = sender.userInfo.note.allNoteText();
        // Application.sharedInstance().alert(sender.userInfo.note.noteId)
        if (text && text.length) {
          self.webController.saveText(text, sender.userInfo.note.noteId);
        }
      },
      toggleSample: function (sender) {
        let lan = NSLocale.preferredLanguages().length
          ? NSLocale.preferredLanguages()[0].substring(0, 2)
          : "en";
        if (self.webController.view.window) {
          self.webController.view.removeFromSuperview();
          NSUserDefaults.standardUserDefaults().setObjectForKey(
            false,
            "marginnote_roam_on"
          );
          let cnTips = "roam已经关闭";
          let enTips = "roam is turned off";
          Application.sharedInstance().showHUD(
            lan === "zh" ? cnTips : enTips,
            self.window,
            2
          );
        } else {
          Application.sharedInstance()
            .studyController(self.window)
            .view.addSubview(self.webController.view);
          self.layoutViewController();
          NSUserDefaults.standardUserDefaults().setObjectForKey(
            true,
            "marginnote_roam_on"
          );
          let cnTips = "roam已经开启";
          let enTips = "roam is turned on";
          Application.sharedInstance().showHUD(
            lan === "zh" ? cnTips : enTips,
            self.window,
            2
          );
          NSTimer.scheduledTimerWithTimeInterval(0.2, false, function () {
            Application.sharedInstance()
              .studyController(self.window)
              .becomeFirstResponder(); //For dismiss keyboard on iOS
          });
        }
        Application.sharedInstance()
          .studyController(self.window)
          .refreshAddonCommands();
      },
    },
    /*Class members*/ {
      addonDidConnect: function () {},
      addonWillDisconnect: function () {},
      applicationWillEnterForeground: function () {},
      applicationDidEnterBackground: function () {},
      applicationDidReceiveLocalNotification: function (notify) {},
    }
  );

  return newAddonClass;
};
