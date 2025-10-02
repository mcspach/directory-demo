const filterTypes = ["office", "school"];
const filters = new Map(filterTypes.map(type => [type, new Set()]));
const directoryListElement = document.getElementById("directoryList");
const dataUrl = directoryListElement.dataset.src;
const resultsCountElement = document.getElementById("resultsCount");
const resetButton = document.getElementById("resetFilters");

// pagination variables
let currentPage = 1;
const itemsPerPage = 12;

const getItems = async () => {
  const response = await fetch(dataUrl);
  const items = await response.json();
  console.log(items);
  return items;
};

// Build filters based on data
const displayFilterOptions = items => {
  // Prepare structures for unique schools/offices and their nested programs/departments
  const schoolMap = new Map();
  const officeMap = new Map();

  items.forEach(item => {
    // Handle schools
    if (item.school && item.school.title) {
      const schoolTitle = item.school.title.trim();
      const programs = item.school.program
        ? item.school.program
            .split(",")
            .map(d => d.trim())
            .filter(Boolean)
        : [];
      if (!schoolMap.has(schoolTitle)) {
        schoolMap.set(schoolTitle, new Set());
      }
      programs.forEach(program => schoolMap.get(schoolTitle).add(program));
    }
    // Handle offices
    if (item.office && item.office.title) {
      const officeTitle = item.office.title.trim();
      const departments = item.office.department
        ? item.office.department
            .split(",")
            .map(d => d.trim())
            .filter(Boolean)
        : [];
      if (!officeMap.has(officeTitle)) {
        officeMap.set(officeTitle, new Set());
      }
      departments.forEach(dept => officeMap.get(officeTitle).add(dept));
    }
  });

  // Render school filters
  let schoolFiltersHtml = "";
  schoolMap.forEach((programs, schoolTitle) => {
    const schoolId = `school_${encodeURIComponent(
      schoolTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
    )}`;
    schoolFiltersHtml += `
      <div class="form-check mb-2">
        <input class="form-check-input parent-checkbox" type="checkbox" id="${schoolId}">
        <label class="form-check-label" for="${schoolId}">${schoolTitle}</label>
        <ul class="ps-3 mb-2">
          ${[...programs]
            .map(program => {
              const normalizedValue =
                schoolTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() +
                "_" +
                program.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
              const programId = `${encodeURIComponent(
                (schoolTitle + "_" + program)
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase()
              )}`;
              return `
              <li>
                <input class="form-check-input" type="checkbox" value="${normalizedValue}" id="${programId}" data-parent="${schoolId}" onchange="updateUrlWithFilters()">
                <label class="form-check-label" for="${programId}">${program}</label>
              </li>
            `;
            })
            .join("")}
        </ul>
      </div>
    `;
  });
  document.getElementById("school_filters").innerHTML = schoolFiltersHtml;

  // Render office filters
  let officeFiltersHtml = "";
  officeMap.forEach((departments, officeTitle) => {
    const officeId = `office_${encodeURIComponent(
      officeTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
    )}`;
    officeFiltersHtml += `
      <div class="form-check mb-2">
        <input class="form-check-input parent-checkbox" type="checkbox" id="${officeId}">
        <label class="form-check-label" for="${officeId}">${officeTitle}</label>
        <ul class="ps-3 mb-2">
          ${[...departments]
            .map(dept => {
              const normalizedValue =
                officeTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() +
                "_" +
                dept.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
              const deptId = `${encodeURIComponent(
                (officeTitle + "_" + dept)
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase()
              )}`;
              return `
              <li>
                <input class="form-check-input" type="checkbox" value="${normalizedValue}" id="${deptId}" data-parent="${officeId}" onchange="updateUrlWithFilters()">
                <label class="form-check-label" for="${deptId}">${dept}</label>
              </li>
            `;
            })
            .join("")}
        </ul>
      </div>
    `;
  });
  document.getElementById("office_filters").innerHTML = officeFiltersHtml;
};

// Function to update the URL with current filters and search parameters
function updateUrlWithFilters() {
  let baseUrl = location.protocol + "//" + location.host + location.pathname;
  let paramString = "?";

  // Add parameter from search input
  let searchValue = $("#directorySearch").val();
  if (searchValue) {
    let searchParam = `search=${encodeURIComponent(searchValue)}`;
    paramString += searchParam;
  }

  // Add parameters from filters
  filterTypes.forEach(type => {
    let selectedValues = [];
    $(`#${type}_filters input:checkbox:checked`).each(function () {
      let filterValue = $(this).val();
      if (filterValue) {
        const formattedValue = filterValue
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase(); // Match the id format
        selectedValues.push(encodeURIComponent(formattedValue)); // Encode special characters for the URL
      }
    });

    if (selectedValues.length > 0) {
      let filterParam = `${type}=${selectedValues.join(",")}`; // Join values with commas
      paramString += paramString === "?" ? filterParam : `&${filterParam}`;
    }
  });

  let urlWithParams = baseUrl + paramString;
  history.replaceState(null, "", urlWithParams); // Update the URL without reloading the page
}

// Helper to render pagination controls
function renderPagination(totalItems, itemsPerPage, currentPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return ""; // No pagination needed

  let html = `<nav aria-label="Directory pagination"><ul class="pagination justify-content-center">`;

  // Previous button
  html += `<li class="page-item${currentPage === 1 ? " disabled" : ""}">
    <a class="page-link" href="#" data-page="${
      currentPage - 1
    }" aria-label="Previous">&laquo; Prev</a>
  </li>`;

  // Helper to add page link
  function addPage(i, active = false) {
    html += `<li class="page-item${active ? " active" : ""}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }

  // Always show first page
  addPage(1, currentPage === 1);

  // Show ellipsis if needed before current-1
  if (currentPage > 3) {
    html += `<li class="page-item truncate"><span>&hellip;</span></li>`;
  }

  // Show previous page (if not first or second)
  if (currentPage - 1 > 1) {
    addPage(currentPage - 1);
  }

  // Show current page (if not first or last)
  if (currentPage !== 1 && currentPage !== totalPages) {
    addPage(currentPage, true);
  }

  // Show next page (if not last or second-to-last)
  if (currentPage + 1 < totalPages) {
    addPage(currentPage + 1);
  }

  // Show ellipsis if needed after current+1
  if (currentPage < totalPages - 2) {
    html += `<li class="page-item truncate"><span>&hellip;</span></li>`;
  }

  // Always show last page (if more than one page)
  if (totalPages > 1) {
    addPage(totalPages, currentPage === totalPages);
  }

  // Next button
  html += `<li class="page-item${
    currentPage === totalPages ? " disabled" : ""
  }">
    <a class="page-link" href="#" data-page="${
      currentPage + 1
    }" aria-label="Next">Next &raquo;</a>
  </li>`;

  html += `</ul></nav>`;
  return html;
}

function displayItemsData(data) {
  const container = $("#directoryList");
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Clamp currentPage if filters reduce total pages
  if (currentPage > totalPages) currentPage = 1;
  // Calculate slice for current page
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = data.slice(startIdx, endIdx);

  // Use fadeOut to smoothly hide the existing content
  container.fadeOut(300, function () {
    // Empty the container after the animation is complete
    container.empty();

    if (!data.length) {
      const noResults = `<div class="col-12 my-5 py-5 d-flex justify-content-center">Sorry, we couldn't find any items that match those selections.</div>`;
      container.append(noResults);
    } else {
      for (const [index, item] of pageItems.entries()) {
        // console.log(`Index: ${index}, Item:`, item);

        const itemRow = `
        <div class="card card-directory">
          <div class="card-img-top">
            <img src="${item.image}" alt="${item.name} Headshot"/>
            <div class="border-corner-top-left"></div>
            <div class="border-corner-bottom-right"></div>
          </div>
          <div class="card-body">
            <a href="${item.link}"><h2 class="h4">${item.name}</h2></a>
            <p>${item.position}</p>
          </div>
        </div>
       `;

        container.append(itemRow);
      }
    }

    // Pagination controls
    const paginationHtml = renderPagination(
      totalItems,
      itemsPerPage,
      currentPage
    );
    $("#directoryPagination").html(paginationHtml);

    // Pagination click handler
    $("#directoryPagination")
      .find(".pagination .page-link")
      .off("click")
      .on("click", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        if (
          !isNaN(page) &&
          page >= 1 &&
          page <= totalPages &&
          page !== currentPage
        ) {
          currentPage = page;
          displayItemsData(data);
          // Optionally scroll to top of results
          container[0].scrollIntoView({ behavior: "smooth" });
        }
      });
    // Use fadeIn to smoothly show the new content
    container.fadeIn(300);
  });

  // Update the result count
  resultsCountElement.innerHTML = totalItems || 0;
}

// Sorting the items by Name in ascending order
function sortItemsByName(items) {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}

function filterManager(itemsData) {
  currentPage = 1;

  const checked = $("input:checkbox:checked");

  let filters = {};
  filterTypes.forEach(type => {
    filters[type] = [];
  });

  // Collect selected filter values
  for (let item of checked) {
    filterTypes.forEach(type => {
      // Match the filter type by checking if the checkbox belongs to the correct filter group
      if ($(item).closest(`#${type}_filters`).length) {
        filters[type].push(item.value);
      }
    });
  }

  let filteredItems = [...itemsData];

  // Apply search filter
  let searchParam = $("#directorySearch").val().toLowerCase();
  if (searchParam) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(searchParam)
    );
  }

  // Apply filters for each type
  filterTypes.forEach(type => {
    if (filters[type].length) {
      filteredItems = filteredItems.filter(item => {
        let parentTitle = "";
        let childrenToCheck = [];
        let hasChildren = false;
        let parentChecked = false;

        if (type === "school" && item.school && item.school.title) {
          parentTitle = item.school.title.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
          hasChildren = !!item.school.program;
          if (hasChildren) {
            childrenToCheck = item.school.program
              .split(",")
              .map(program =>
                (item.school.title + "_" + program)
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase()
              );
          }
        }
        if (type === "office" && item.office && item.office.title) {
          parentTitle = item.office.title.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
          hasChildren = !!item.office.department;
          if (hasChildren) {
            childrenToCheck = item.office.department
              .split(",")
              .map(dept =>
                (item.office.title + "_" + dept)
                  .replace(/[^a-zA-Z0-9_]/g, "")
                  .toLowerCase()
              );
          }
        }

        // Check if parent checkbox is checked
        parentChecked = filters[type].some(filterValue => {
          const normalizedFilter = filterValue
            .trim()
            .replace(/[^a-zA-Z0-9_]/g, "")
            .toLowerCase();
          return normalizedFilter === parentTitle;
        });

        if (parentChecked) {
          // If parent is checked, match by parent only
          return parentTitle !== "";
        } else if (childrenToCheck.length) {
          // If parent is not checked, match by child checkboxes as before
          return filters[type].some(filterValue => {
            const normalizedFilter = filterValue
              .trim()
              .replace(/[^a-zA-Z0-9_]/g, "")
              .toLowerCase();
            return childrenToCheck.includes(normalizedFilter);
          });
        }
        return false;
      });
    }
  });

  // Display the filtered items
  displayItemsData(filteredItems);
}

// Check the filter checkboxes according to URL parameters
function markFilters(filterArray) {
  filterArray.forEach(filterString => {
    const filterValues = filterString.split(",");
    filterValues.forEach(filterValue => {
      // Ignore default 'on' value
      if (filterValue === "on") return;

      // Normalize the filter value for comparison
      const normalizedValue = filterValue
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase();

      // Find all checkboxes with a matching value (school/program or office/department)
      $(`input.form-check-input[type="checkbox"]`).each(function () {
        const checkboxValue = ($(this).val() || "")
          .replace(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase();

        if (checkboxValue === normalizedValue) {
          $(this).prop("checked", true);
        }
      });
    });
  });
}

getItems().then(data => {
  const itemsData = data;
  // Populate filters
  displayFilterOptions(itemsData);

  // Add parent checkbox click event
  $(document).on("click", ".parent-checkbox", function () {
    const parentId = $(this).attr("id");
    const nested = $(`input[data-parent="${parentId}"]`);
    const allChecked =
      nested.length && nested.filter(":checked").length === nested.length;
    nested.prop("checked", !allChecked).trigger("change");
  });

  // Add nested checkbox change event to update parent checkbox state
  $(document).on(
    "change",
    'input.form-check-input[type="checkbox"]:not(.parent-checkbox)',
    function () {
      const parentId = $(this).data("parent");
      // console.log("Parent ID:", parentId);
      if (!parentId) return;
      const nested = $(`input[data-parent="${parentId}"]`);
      const parentCheckbox = $(`#${parentId}`);
      if (nested.length === nested.filter(":checked").length) {
        parentCheckbox.prop("checked", true);
      } else {
        parentCheckbox.prop("checked", false);
      }
    }
  );

  // Reset button
  resetButton.addEventListener("click", function () {
    $("input:checkbox").prop("checked", false);
    $("#directorySearch").val("");
    currentPage = 1;
    let baseUrl = location.protocol + "//" + location.host + location.pathname;
    history.replaceState(null, "", baseUrl);
    // Refresh the displayed items (show all)
    filterManager(itemsData);
  });

  // Initial display of items
  const sortedItems = sortItemsByName(itemsData);
  displayItemsData(sortedItems);

  $("#directoryFilters").on("change", () => {
    filterManager(itemsData);
    updateUrlWithFilters();
  });

  $("#directorySearch").on("keyup", () => {
    filterManager(itemsData);
    updateUrlWithFilters();
  });

  // Parse the query parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchValue = urlParams.get("search");
  if (searchValue) {
    $("#directorySearch").val(decodeURIComponent(searchValue)); // Decode special characters
  }
  filterTypes.forEach(type => {
    const filters = urlParams.get(type);
    if (filters) {
      markFilters([filters]); // Pass the raw encoded string to markFilters
    }
  });

  // Add event listener to itemSearch input
  $("#directorySearch").on("keypress", function (event) {
    // Prevent form submission on Enter key press
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  // Trigger the change event to apply the initial filtering
  $("#directoryFilters").trigger("change");
});
