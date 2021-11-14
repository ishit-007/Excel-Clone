let row_numbers_section = document.querySelector(".row-numbers-section");
let last_highlighted_cell;
let cell_selected_div = document.querySelector(".selected-cell-div");
let selectstyle = document.querySelector(".fontstyleselect");
let selectsize = document.querySelector(".fontsizeselect");
for (let i = 1; i <= 100; i++) {
  let newdiv = document.createElement("div");
  newdiv.innerText = i;
  newdiv.classList.add("row-number-div");
  row_numbers_section.append(newdiv);
}
let column_tags_section = document.querySelector(".column-tags-section");
for (let i = 0; i < 26; i++) {
  let ascii = 65 + i;
  let newchar = String.fromCharCode(ascii);
  let new_div = document.createElement("div");
  new_div.innerText = newchar;
  new_div.classList.add("column-tag");
  column_tags_section.append(new_div);
}
let cells_section = document.querySelector(".cells-section");
let data_obj = {};
for (let i = 1; i <= 100; i++) {
  let rowDiv = document.createElement("div");
  rowDiv.classList.add("row");
  for (let j = 0; j < 26; j++) {
    let ascii = 65 + j;
    let newchar = String.fromCharCode(ascii);
    let cellAddress = newchar + i; //A1 B1............Z1

    data_obj[cellAddress] = {
      value: undefined,
      formula: undefined,
      downstream: [],
      upstream: [],
      align: "right",
      color: "black",
      bgcolor: "white",
      fontstyle: "Times new Roman",
      fontsize: "Medium",
      bold: false,
      italics: false,
      underline: false,
    };

    let cellDiv = document.createElement("div");

    //assuming that we will only enter direct values in cells and only formulas in Formula Bar
    cellDiv.addEventListener("input", function (e) {
      let current_cell_address = e.currentTarget.getAttribute("data-address");
      let current_cell_object = data_obj[current_cell_address];
      current_cell_object.value = e.currentTarget.innerText;
      current_cell_object.formula = undefined;
      // iterate on upsteam, remove yourself from their DS, clearing your upstream
      let current_upstream = current_cell_object.upstream;
      for (let k = 0; k < current_upstream.length; k++) {
        //removeFromDownStream(Parent,Child)
        removeFromDownStream(current_upstream[k], current_cell_address);
      }
      current_cell_object.upstream = [];

      let current_downstream = current_cell_object.downstream;
      for (let k = 0; k < current_downstream.length; k++) {
        updateCell(current_downstream[k]);
      }
      data_obj[cellAddress] = current_cell_object;
    });
    cellDiv.classList.add("cell");
    cellDiv.setAttribute("data-address", cellAddress);
    cellDiv.contentEditable = "true";
    cellDiv.addEventListener("click", function (e) {
      if (cellDiv.innerText == "") {
        cellDiv.style.fontFamily = selectstyle.value;
        data_obj[cellAddress].fontstyle = selectstyle.value;
        cellDiv.style.fontSize = selectsize.value;
        data_obj[cellAddress].fontsize = selectsize.value;
      } else {
        data_obj[cellAddress].fontstyle = selectstyle.value;
        data_obj[cellAddress].fontsize = selectsize.value;
      }

      if (last_highlighted_cell != undefined) {
        last_highlighted_cell.classList.remove("cell-selected");
      }
      e.currentTarget.classList.add("cell-selected");
      let selected_cell_address = e.currentTarget.getAttribute("data-address");
      cell_selected_div.innerText = selected_cell_address;
      last_highlighted_cell = e.currentTarget;
    });
    rowDiv.append(cellDiv);
  }
  cells_section.append(rowDiv);
}
// if (localStorage.getItem("sheet") != "" && localStorage.getItem("sheet") != undefined) {
//   data_obj = JSON.parse(localStorage.getItem("sheet"));

//   for (x in data_obj) {
//     let cell = document.querySelector(`[data-address=${x}]`);
//     if(data_obj[x].value)
//     cell.innerText = data_obj[x].value;
//   }
// }

if (localStorage.getItem("sheet")) {
  data_obj = JSON.parse(localStorage.getItem("sheet"));
  for (celladdress in data_obj) {
    let correspondingcell = document.querySelector(
      `[data-address=${celladdress}]`
    );
    if (
      data_obj[celladdress].value != undefined &&
      data_obj[celladdress].value != "" &&
      data_obj[celladdress].value != null
    ) {
      correspondingcell.innerText = data_obj[celladdress].value;
      correspondingcell.style.color = data_obj[celladdress].color;
      correspondingcell.style.backgroundColor = data_obj[celladdress].bgcolor;
      correspondingcell.style.fontFamily = data_obj[celladdress].fontstyle;
      correspondingcell.style.fontSize = data_obj[celladdress].fontsize;
      correspondingcell.style.justifyContent = data_obj[celladdress].align;
      if (data_obj[celladdress].bold) {
        correspondingcell.style.fontWeight = "bold";
      }
      if (data_obj[celladdress].italics) {
        correspondingcell.style.fontStyle = "italic";
      }
      if (data_obj[celladdress].underline) {
        correspondingcell.style.textDecoration = "underline";
      }
    }
  }
}

cells_section.addEventListener("scroll", function (e) {
  //console.log(e.currentTarget.scrollLeft);      gives left se scrolled distance
  let left_scroll_distance = e.currentTarget.scrollLeft;
  column_tags_section.style.transform = `translateX(-${left_scroll_distance}px)`;
  let up_scroll_distance = e.currentTarget.scrollTop;
  row_numbers_section.style.transform = `translateY(-${up_scroll_distance}px)`;
});

function removeFromDownStream(ParentCell, ChildCell) {
  let requiredDS = data_obj[ParentCell].downstream;
  let modifiedDS = [];
  for (let i = 0; i < requiredDS.length; i++) {
    if (requiredDS[i] != ChildCell) {
      modifiedDS.push(requiredDS[i]);
    }
  }
  data_obj[ParentCell].downstream = modifiedDS;
}

function updateCell(cell) {
  let reqd_obj = data_obj[cell];
  let reqd_Upstream = reqd_obj.upstream;
  let reqd_formula = reqd_obj.formula;
  let values_obj = {};
  for (let k = 0; k < reqd_Upstream.length; k++) {
    let celladd = reqd_Upstream[k];
    let cellval = data_obj[reqd_Upstream[k]].value;
    values_obj[celladd] = cellval;
  }
  for (key in values_obj) {
    reqd_formula = reqd_formula.replaceAll(key, values_obj[key]);
  }
  let reqd_downstream = reqd_obj.downstream;
  let newValue = eval(reqd_formula);
  data_obj[cell].value = newValue;
  for (let k = 0; k < reqd_downstream.length; k++) {
    updateCell(reqd_downstream[k]);
  }

  let celltobeupdateddiv = document.querySelector(`[data-address=${cell}]`);
  celltobeupdateddiv.innerText = newValue;
}
function addtoDownstream(parent, child) {
  data_obj[parent].downstream.push(child);
}

let formula_input = document.querySelector(".formula-bar-div");
formula_input.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    let typed_formula = e.currentTarget.value;
    if (last_highlighted_cell == undefined) {
      return;
    } else {
      let selected_c_address =
        last_highlighted_cell.getAttribute("data-address");
      let cellobj = data_obj[selected_c_address];
      cellobj.formula = typed_formula;
      let US = cellobj.upstream;
      for (let k = 0; k < US.length; k++) {
        removeFromDownStream(US[k], selected_c_address);
      }
      let splittedformula = typed_formula.split(" ");
      let newUS = [];
      for (let k = 0; k < splittedformula.length; k++) {
        let ch = splittedformula[k];
        if (ch == "+" || ch == "-" || ch == "*" || ch == "/" || !isNaN(ch)) {
        } else {
          newUS.push(splittedformula[k]);
          addtoDownstream(splittedformula[k], selected_c_address);
        }
      }
      cellobj.upstream = newUS;

      let values_obj = {};
      for (let k = 0; k < newUS.length; k++) {
        let celladd = newUS[k];
        let cellval = data_obj[celladd].value;
        values_obj[celladd] = cellval;
      }
      for (key in values_obj) {
        typed_formula = typed_formula.replaceAll(key, values_obj[key]);
      }
      let newValue = eval(typed_formula);
      cellobj.value = newValue;
      let DS = cellobj.downstream;
      for (let k = 0; k < DS.length; k++) {
        updateCell(DS[k]);
      }
      data_obj[selected_c_address] = cellobj;

      let reqdcell = document.querySelector(
        `[data-address=${selected_c_address}]`
      );
      reqdcell.innerText = newValue;
      e.currentTarget.value = "";
    }
  }
});

let help_btn = document.querySelector(".helpbtn");
help_btn.addEventListener("click", function (e) {
  alert("Even God helps those, who help themselves :)");
});
