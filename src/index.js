import React from "react";
import { render } from "react-dom";
import "./styles.css";
import { css } from "emotion";
import DefaultTheme from "./themes/default/index.js";
import filter from "./filter.js";

const themes = {
  DefaultLight: DefaultTheme,
  DefaultDark: DefaultTheme
};

const rootFolder = { id: "1", title: "Bookmarks" };

class App extends React.Component {
  state = {
    bookmarks: [],
    theme: "DefaultLight",
    currentFolder: rootFolder,
    folderTarget: "new",
    path: []
  };

  getDefaultFolder = () => {
    chrome.storage.local.get(["folder"], ({ folder = rootFolder.id }) => {
      rootFolder.id = folder;
      this.initialBookmarks();
    });
  };

  changeFolder = ({ currentFolder = "", nextFolder }) => {
    this.getBookmarks(nextFolder.id).then(bookmarks =>
      this.setState(({ path }) => {
        if (currentFolder) {
          return {
            bookmarks,
            currentFolder: nextFolder,
            path: [...path, currentFolder]
          };
        } else {
          path = path.slice(0, path.map(({ id }) => id).indexOf(nextFolder.id));
          return {
            bookmarks,
            currentFolder: nextFolder,
            path
          };
        }
      })
    );
  };

  getTheme = () => {
    chrome.storage.local.get(["theme"], ({ theme = this.state.DefaultTheme }) =>
      this.changeTheme({ theme })
    );
  };

  changeTheme = ({ theme }) => {
    if (theme) {
      this.setState({
        theme
      });
    }
  };

  getTarget = () => {
    chrome.storage.local.get(["target"], ({ target = "new" }) => {
      this.changeTarget({ target });
    });
  };

  changeTarget = ({ target }) => {
    if (target) {
      this.setState({
        folderTarget: target
      });
    }
  };

  receiveOptions = change => {
    if (change["theme"]) {
      this.changeTheme({ theme: change["theme"]["newValue"] });
    }
    if (change["folder"]) {
      rootFolder.id = change["folder"]["newValue"];
      this.initialBookmarks();
    }
    if (change["target"]) {
      this.changeTarget({ target: change["target"]["newValue"] });
    }
  };

  initialBookmarks = () => {
    this.getBookmarks(rootFolder.id).then(bookmarks => {
      if (bookmarks) {
        this.setState({ bookmarks, currentFolder: rootFolder, path: [] });
      }
    });
  };

  getBookmarks = async folder => {
    let bookmarks = [];
    let sort = (a, b) => a.index - b.index;
    try {
      bookmarks = await new Promise(resolve =>
        chrome.bookmarks.getChildren(folder, b => {
          if (!chrome.runtime.lastError) {
            resolve(b);
          } else {
            resolve(this.getBookmarks("1"));
          }
        })
      );
    } catch (e) {
      console.log(`Error: ${e}`);
    }
    return filter(bookmarks).sort(sort);
  };

  updateBookmarks = () => {
    this.getBookmarks(this.state.currentFolder.id).then(bookmarks => {
      if (bookmarks) {
        this.setState({ bookmarks });
      }
    });
  };

  receiveBookmarks = () => {
    chrome.bookmarks.get(this.state.currentFolder.id, () => {
      if (!chrome.runtime.lastError) {
        this.updateBookmarks();
      } else {
        this.initialBookmarks();
      }
    });
  };

  componentDidMount() {
    this.getTheme();
    this.getDefaultFolder();
    this.getTarget();
    chrome.storage.onChanged.addListener(this.receiveOptions);
    chrome.bookmarks.onChanged.addListener(this.receiveBookmarks);
    chrome.bookmarks.onCreated.addListener(this.receiveBookmarks);
    chrome.bookmarks.onMoved.addListener(this.receiveBookmarks);
    chrome.bookmarks.onRemoved.addListener(this.receiveBookmarks);
    chrome.bookmarks.onChildrenReordered.addListener(this.receiveBookmarks);
  }

  componentWillUnmount() {
    chrome.storage.onChanged.removeListener(this.receiveOptions);
    chrome.bookmarks.onChanged.removeListener(this.receiveBookmarks);
    chrome.bookmarks.onCreated.removeListener(this.receiveBookmarks);
    chrome.bookmarks.onMoved.removeListener(this.receiveBookmarks);
    chrome.bookmarks.onRemoved.removeListener(this.receiveBookmarks);
    chrome.bookmarks.onChildrenReordered.removeListener(this.receiveBookmarks);
  }

  focusRef = null;

  setFocusRef = element => {
    this.focusRef = element;
  };

  setFocus = () => {
    this.focusRef.focus();
  };

  componentDidUpdate() {
    this.setFocus();
    window.scrollTo(0, 0);
  }

  render() {
    let { bookmarks, theme, path, currentFolder, folderTarget } = this.state;
    let noOutline = css({ outline: 0 });

    let Theme = themes[theme];
    return (
      <div ref={this.setFocusRef} tabIndex="-1" class={noOutline}>
        <Theme
          {...{
            bookmarks,
            currentFolder,
            path,
            theme,
            changeFolder: this.changeFolder,
            isRoot: currentFolder.id === rootFolder.id,
            folderTarget
          }}
        />
      </div>
    );
  }
}

render(<App />, document.querySelector("#app"));
