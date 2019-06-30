import "./options.css";

function init() {
  function getTheme() {
    chrome.storage.local.get(["theme"], ({ theme = "DefaultLight" }) => {
      themeDiv.className = theme;
    });
  }

  function setTheme(theme) {
    chrome.storage.local.set({ theme });
    themeDiv.className = theme;
  }

  function setLightTheme() {
    setTheme("DefaultLight");
  }

  function setDarkTheme() {
    setTheme("DefaultDark");
  }

  function getFolder() {
    chrome.storage.local.get(["folder"], ({ folder = "1" }) => {
      updateFolders(folder);
    });
  }

  function setFolder(e) {
    chrome.storage.local.set({ folder: e.target.value });
  }

  async function getTarget() {
    chrome.storage.local.get(["target"], ({ target = "new" }) => {
      updateTarget(target);
    });
  }

  function setTarget(e) {
    chrome.storage.local.set({ target: e.target.value });
  }

  function updateFolders(defaultFolder) {
    let folders = "";

    function addFolder(id, title) {
      let selected = id === defaultFolder ? " selected" : "";
      folders += `<option value="${id}"${selected}>${title}</option>`;
    }

    function makeIndent(indentLength) {
      return "&nbsp;&nbsp;".repeat(indentLength);
    }

    function logItems(bookmarkItem, indent) {
      if (!bookmarkItem.url) {
        if (bookmarkItem.id !== "0") {
          addFolder(
            bookmarkItem.id,
            `${makeIndent(indent)}${bookmarkItem.title}`
          );
          indent++;
        }
        if (bookmarkItem.children) {
          bookmarkItem.children.forEach(child => logItems(child, indent));
        }
      }
    }

    function logTree(bookmarkItems) {
      if (!chrome.runtime.lastError) {
        logItems(bookmarkItems[0], 0);
        selectFolder.innerHTML = folders;
      } else {
        console.log(`An error: ${chrome.runtime.lastError}`);
      }
    }

    chrome.bookmarks.getTree(logTree);
  }

  function updateTarget(target) {
    folderTarget.value = target;
  }

  let themeDiv = document.querySelector("#theme");
  let lightButton = document.querySelector("#defaultLightBtn");
  let darkButton = document.querySelector("#defaultDarkBtn");
  let selectFolder = document.querySelector("#selectFolder");
  let folderTarget = document.querySelector("#folderTarget");
  getTheme();
  getFolder();
  getTarget();

  lightButton.addEventListener("click", setLightTheme);
  darkButton.addEventListener("click", setDarkTheme);
  selectFolder.addEventListener("change", setFolder);
  folderTarget.addEventListener("change", setTarget);
}

document.onload = init();
