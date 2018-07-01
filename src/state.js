import chromeBookmarks from "./bookmarks.js";

const getLinkName = name => {
  name = /:\/\/(?:www\.)?(.*?)(?:\?|\/|$)/i.exec(name)[1].toLowerCase();
  return name.split(".");
};

const getFileName = name => {
  name = /:\/\/.*\/(.*?)$/i.exec(name)[1].toLowerCase();
  return name.split(".");
};

const getType = url => {
  if (/(http|ftp)/i.test(url)) {
    return "link";
  } else {
    return "file";
  }
};

const data = () => {
  const getBookmarks = async () => {
    let bookmarks = [];
    bookmarks = await chromeBookmarks();
    try {
      bookmarks = bookmarks.map(({ title, url }) => {
        let type = getType(url);
        let name = type === "link" ? getLinkName(url) : getFileName(url);
        return { title, url, type, name };
      });
    } catch (e) {
      console.log(`Error: ${e}`);
    }

    return { bookmarks };
  };

  return getBookmarks();
};

export default data;
