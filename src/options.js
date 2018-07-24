import { h, Component, render } from "preact";
import { css } from "preact-emotion";
import "./options.css";

let options = css({
  padding: "0 5px 20px 20px"
});

class Options extends Component {
  state = {
    theme: "DefaultLight",
    themes: [
      { id: "DefaultLight", title: "Default (Light)" },
      { id: "DefaultDark", title: "Default (Dark)" }
    ]
  };

  getTheme = () => {
    chrome.storage.local.get(["theme"], ({ theme }) =>
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

  componentDidMount() {
    this.getTheme();
  }

  handleChange = e => {
    this.setState({
      theme: e.target.value
    });
    chrome.storage.local.set({ theme: e.target.value });
  };

  render({}, { theme, themes }) {
    return (
      <div>
        <label class={options}>Theme: </label>
        <select value={theme} onChange={this.handleChange}>
          {themes.map(({ id, title }) => <option value={id}>{title}</option>)}
        </select>
      </div>
    );
  }
}

render(<Options />, document.body, document.body.lastElementChild);
