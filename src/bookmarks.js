export default () =>
  new Promise(resolve =>
    chrome.bookmarks.getChildren("1", b => {
      let bookmarks = b.map(({ title, url }) => {
        return { title, url };
      });
      resolve(bookmarks);
    })
  );
