const filterTypes = ["offices", "schools"];
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
  let items = await response.json();
  items = sortItemsByName(items);
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
    if (Array.isArray(item.schools) && item.schools.length > 0) {
      // Iterate each school entry for this item and populate schoolMap
      item.schools.forEach(itemSchool => {
        if (!itemSchool || !itemSchool.title) return;
        const schoolTitle = String(itemSchool.title).trim();
        if (!schoolTitle) return;

        if (!schoolMap.has(schoolTitle)) {
          schoolMap.set(schoolTitle, []);
        }

        // Add programs (if any) to the school's set
        const programs = Array.isArray(itemSchool.programs)
          ? itemSchool.programs
          : [];
        programs.forEach(program => {
          if (program == null) return;
          const p = String(program).trim();
          if (p && !schoolMap.get(schoolTitle).includes(p))
            schoolMap.get(schoolTitle).push(p);
        });
      });
      schoolMap.forEach((programs, schoolTitle) => {
        // Sort the programs array alphabetically
        const sortedPrograms = programs
          .slice()
          .sort((a, b) => a.localeCompare(b));

        // Redefine the value in the existing map for this schoolTitle
        schoolMap.set(schoolTitle, sortedPrograms);
      });
    }
    // Handle offices
    if (Array.isArray(item.offices) && item.offices.length > 0) {
      // Iterate each office entry for this item and populate officeMap
      item.offices.forEach(itemOffice => {
        if (!itemOffice || !itemOffice.title) return;
        const officeTitle = String(itemOffice.title).trim();
        if (!officeTitle) return;

        if (!officeMap.has(officeTitle)) {
          officeMap.set(officeTitle, []);
        }

        // Add departments (if any) to the office's set
        const departments = Array.isArray(itemOffice.departments)
          ? itemOffice.departments
          : [];
        departments.forEach(department => {
          if (department == null) return;
          const dept = String(department).trim();
          if (dept && !officeMap.get(officeTitle).includes(dept))
            officeMap.get(officeTitle).push(dept);
        });
      });
      officeMap.forEach((departments, officeTitle) => {
        // Sort the departments array alphabetically
        const sortedDepartments = departments
          .slice()
          .sort((a, b) => a.localeCompare(b));

        // Redefine the value in the existing map for this officeTitle
        officeMap.set(officeTitle, sortedDepartments);
      });
    }
  });

  // Render school filters
  // console.log("schoolMap:", schoolMap);
  let schoolFiltersHtml = "";
  schoolMap.forEach((programs, schoolTitle) => {
    const schoolId = `school_${encodeURIComponent(
      schoolTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
    )}`;
    schoolFiltersHtml += `
      <div class="form-check mb-2">
        <input class="form-check-input parent-checkbox" type="checkbox" id="${schoolId}" value="${schoolId}">
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
  document.getElementById("schools_filters").innerHTML = schoolFiltersHtml;

  // Render office filters
  // console.log("officeMap:", officeMap);
  let officeFiltersHtml = "";
  officeMap.forEach((departments, officeTitle) => {
    const officeId = `office_${encodeURIComponent(
      officeTitle.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
    )}`;
    officeFiltersHtml += `
      <div class="form-check mb-2">
        <input class="form-check-input parent-checkbox" type="checkbox" id="${officeId}" value="${officeId}" >
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
  document.getElementById("offices_filters").innerHTML = officeFiltersHtml;
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
    let parentChecked = false;
    let parentValue = "";

    // Find parent checkbox for this type
    const parentCheckbox = $(`#${type}_filters .parent-checkbox:checked`);
    if (parentCheckbox.length) {
      parentChecked = true;
      parentValue = parentCheckbox.val();
    }

    if (parentChecked) {
      // Only push the parent value
      selectedValues.push(encodeURIComponent(parentValue));
    } else {
      // Push all checked child values
      $(`#${type}_filters input:checkbox:checked:not(.parent-checkbox)`).each(
        function () {
          let filterValue = $(this).val();
          if (filterValue) {
            const formattedValue = filterValue
              .replace(/[^a-zA-Z0-9_]/g, "")
              .toLowerCase();
            selectedValues.push(encodeURIComponent(formattedValue));
          }
        }
      );
    }

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
  return items.slice().sort((a, b) => {
    const getLastName = name => {
      if (!name) return "";
      const parts = name.trim().split(/\s+/).filter(Boolean);
      return parts.length ? parts[parts.length - 1] : "";
    };
    return getLastName(a.name).localeCompare(getLastName(b.name));
  });
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

  // Apply checkbox filters
  filterTypes.forEach(type => {
    if (filters[type] && filters[type].length) {
      filteredItems = filteredItems.filter(item => {
        let parentTitles = [];
        let childrenToCheck = [];
        const normalize = s =>
          String(s || "")
            .trim()
            .replace(/[^a-zA-Z0-9_]/g, "")
            .toLowerCase();

        if (type === "schools" && item.schools) {
          parentTitles = item.schools.map(school => normalize(school.title));
          console.log("in schools (parents)", parentTitles);

          childrenToCheck = item.schools.flatMap(school =>
            school.programs && school.programs.length > 0
              ? school.programs.map(program =>
                  normalize(school.title + "_" + program)
                )
              : []
          );
        }

        if (type === "offices" && item.offices) {
          parentTitles = item.offices.map(office => normalize(office.title));
          console.log("in offices (parents)", parentTitles);

          childrenToCheck = item.offices.flatMap(office =>
            office.departments && office.departments.length > 0
              ? office.departments.map(dept =>
                  normalize(office.title + "_" + dept)
                )
              : []
          );
        }

        // Normalize selected filters and split into parent vs child filters
        const normalizedFilters = (filters[type] || []).map(f => normalize(f));
        // use singular prefix to match generated checkbox IDs (e.g. "office_x", "school_x")
        const parentPrefix = type.replace(/s$/, "") + "_";
        const parentFilters = normalizedFilters
          .filter(f => f.startsWith(parentPrefix))
          .map(f => f.slice(parentPrefix.length)); // remove "school_" or "office_" prefix
        const childFilters = normalizedFilters.filter(
          f => !f.startsWith(parentPrefix)
        );

        // Check if any parent title matches any parent filter
        const parentChecked = parentFilters.some(pf =>
          parentTitles.includes(pf)
        );

        if (parentChecked) {
          // If parent is checked but no child filters selected, match the item (parent-only selection)
          if (childFilters.length === 0) return true;

          // If parent is checked but this item has no children, treat as a match
          if (childrenToCheck.length === 0) return true;

          // Otherwise require at least one selected child to match the item's children
          return childFilters.some(cf => childrenToCheck.includes(cf));
        } else if (childrenToCheck.length > 0) {
          // No parent selected: match if any selected child filter matches item's children
          return normalizedFilters.some(f => childrenToCheck.includes(f));
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

          const childSelector = `input.form-check-input[type="checkbox"][data-parent="${$(
            this
          ).val()}"]`;
          $(childSelector).prop("checked", true);
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
    'input.form-check-input[type="checkbox"]',
    function () {
      const parentId = $(this).data("parent");
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

  displayItemsData(itemsData);

  $("#directoryFilters").on("change", () => {
    setTimeout(() => {
      filterManager(itemsData);
      updateUrlWithFilters();
    }, 20); // 20ms delay
  });

  $("#directorySearch").on("keyup", () => {
    setTimeout(() => {
      filterManager(itemsData);
      updateUrlWithFilters();
    }, 20); // 20ms delay
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
