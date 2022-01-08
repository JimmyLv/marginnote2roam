function redirectToLastUsedGraph() {
  const lastUsedGraph = localStorage.getItem("lastUsedGraph");
  location.href = "https://roamresearch.com/#/app/" + lastUsedGraph;
}
redirectToLastUsedGraph();

function getDataUid() {
  var dt = new Date();
  var year = dt.getFullYear();
  var month = (dt.getMonth() + 1).toString().padStart(2, "0");
  var day = dt.getDate().toString().padStart(2, "0");
  return month + "-" + day + "-" + year;
}

function getPageUid() {
  const [, pageUid] = window.location.href.split("/page/");
  return pageUid;
}

async function getParentChildren(parentUid) {
  const parents = await window.roamAlphaAPI.q(
    `[:find (pull ?p [:block/children, :block/uid]) :where [?p :block/uid "` +
      parentUid +
      `"]]`
  );
  if (parents.length === 0 || !parents[0]) {
    throw new Error(`No existing parent of uid ` + parentUid);
  }
  return parents[0]?.[0]?.children;
}

async function createBlockIntoRoam(result, noteId) {
  const dateUid = getDataUid();
  const pageUid = getPageUid();

  const parentUid = pageUid || dateUid;

  const children = await getParentChildren(parentUid);

  const uidObj = noteId === "undefined" ? undefined : { uid: noteId };

  window.roamAlphaAPI.createBlock({
    location: {
      "parent-uid": parentUid,
      order: children?.length || 0,
    },
    block: {
      ...uidObj,
      string: result,
    },
  });
}
