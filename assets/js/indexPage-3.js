$(".dropdown-trigger").dropdown();

const favoriteParks = {};
$(document).ready(function () {
  let savedParks = JSON.parse(localStorage.getItem("favoriteParks"));
  Object.keys(savedParks).forEach((el) => {
    favoriteParks[el] = "";
    $("#dropdown1").append(
      $("<li>")
        .addClass("list")
        .append(
          $("<a>")
            .text(el)
            .attr(
              "href",
              $(this).siblings(".description").children().attr("href")
            )
            .attr("target", "_blank")
        )
        .append(
          $("<button>").text("-").attr("data-name", el).addClass("btn delete")
        )
    );
  });
  const deleteBtns = document.querySelectorAll(".btn.delete");
  deleteBtns.forEach((el) => {
    el.addEventListener("click", (e) => {
      const toDelete = e.target.dataset.name;
      delete savedParks[toDelete];
      console.log(savedParks);
      localStorage.setItem("favoriteParks", JSON.stringify(savedParks));
      window.location.reload();
    });
  });
});

$(`.saveBtn`).on("click", function () {
  var parkName = $(this).siblings(".parkName").text();
  favoriteParks[parkName] = "";
  $("#dropdown1").append(
    $("<li>")
      .addClass("list")
      .append(
        $("<a>")
          .text(parkName)
          .attr(
            "href",
            $(this).siblings(".description").children().attr("href")
          )
          .attr("target", "_blank")
          .append($("<button>").text("-").addClass("btn delete"))
      )
  );
  localStorage.setItem("favoriteParks", JSON.stringify(favoriteParks));
});

let deleteParks = document.querySelectorAll("#dropdown1 .delete");
