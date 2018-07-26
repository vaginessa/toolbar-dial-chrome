import { h, Component, render } from "preact";
import "./index.css";
import { css } from "preact-emotion";
import DefaultTheme from "./themes/default/index.js";
import filter from "./filter.js";

const themes = {
  DefaultLight: DefaultTheme,
  DefaultDark: DefaultTheme
};

const rootFolder = { id: "1", title: "Bookmarks" };

class App extends Component {
  state = {
    bookmarks: [],
    theme: "DefaultLight",
    currentFolder: rootFolder,
    path: []
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

  changeTheme = ({ theme }) => {
    if (theme) {
      this.setState({
        theme
      });
    }
  };

  receiveTheme = ({ theme }) => {
    this.changeTheme({ theme: theme.newValue });
  };

  receiveBookmarks = () => {
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
          resolve(b);
        })
      );
    } catch (e) {
      console.log(`Error: ${e}`);
    }
    return filter(bookmarks).sort(sort);
  };

  getTheme = () => {
    chrome.storage.local.get(["theme"], ({ theme }) =>
      this.changeTheme({ theme })
    );
  };

  componentDidMount() {
    this.receiveBookmarks();
    this.getTheme();
    chrome.storage.onChanged.addListener(this.receiveTheme);
    chrome.bookmarks.onChanged.addListener(this.receiveBookmarks);
    chrome.bookmarks.onCreated.addListener(this.receiveBookmarks);
    chrome.bookmarks.onMoved.addListener(this.receiveBookmarks);
    chrome.bookmarks.onRemoved.addListener(this.receiveBookmarks);
    chrome.bookmarks.onChildrenReordered.addListener(this.receiveBookmarks);
  }

  componentWillUnmount() {
    chrome.storage.onChanged.removeListener(this.receiveTheme);
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

  render({}, { bookmarks, theme, path, currentFolder }) {
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
            isRoot: currentFolder.id === rootFolder.id
          }}
        />
      </div>
    );
  }
}

render(<App />, document.body, document.body.lastElementChild);
