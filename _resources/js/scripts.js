//Adds auto focus to search when opened
$("#siteSearch").on("shown.bs.modal", function () {
  $("body").addClass("modal-open-search");
  $("#siteSearch .form-text").focus();
});
$("#siteSearch").on("hide.bs.modal", function () {
  $("body").removeClass("modal-open-search");
});

$("#site-navigation").on("shown.bs.modal", function () {
  $("body").addClass("modal-open-menu-mobile");
});
$("#site-navigation").on("hide.bs.modal", function () {
  $("body").removeClass("modal-open-menu-mobile");
});

jQuery(document).ready(function ($) {
  var alterClass = function () {
    var ww = document.body.clientWidth;
    if (ww >= 1200) {
      $(".modal").modal("hide");
    }
  };
  $(window).resize(function () {
    alterClass();
  });
  //Fire it when the page first loads:
  alterClass();
});

//Scroll to top button
jQuery(document).ready(function ($) {
  // browser window scroll (in pixels) after which the "back to top" link is shown
  var offset = 300,
    //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
    offset_opacity = 1200,
    //duration of the top scrolling animation (in ms)
    scroll_top_duration = 700,
    //grab the "back to top" link
    $back_to_top = $(".cd-top");

  //hide or show the "back to top" link
  $(window).scroll(function () {
    $(this).scrollTop() > offset
      ? $back_to_top.addClass("cd-is-visible")
      : $back_to_top.removeClass("cd-is-visible cd-fade-out");
    if ($(this).scrollTop() > offset_opacity) {
      $back_to_top.addClass("cd-fade-out");
    }
  });

  //smooth scroll to top
  $back_to_top.on("click", function (event) {
    event.preventDefault();
    $("body,html").animate(
      {
        scrollTop: 0,
      },
      scroll_top_duration
    );
  });
});

$(document).ready(function () {
  document.getElementById("year").innerHTML = new Date().getFullYear();
});

$(document).ready(function () {
  // Select all links with hashes
  $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .not("[data-bs-toggle]")
    .click(function (event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, "") ===
          this.pathname.replace(/^\//, "") &&
        location.hostname === this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length
          ? target
          : $("[name=" + this.hash.slice(1) + "]");
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $("html, body").animate(
            {
              scrollTop: target.offset().top,
            },
            1000,
            function () {
              // Callback after animation
              // Must change focus!
              var $target = $(target);
              $target.focus();
              if ($target.is(":focus")) {
                // Checking if the target was focused
                return false;
              } else {
                $target.attr("tabindex", "-1"); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
              }
            }
          );
        }
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var cookieAlert = document.querySelector(".cookiealert");
  var acceptCookies = document.querySelector(".acceptcookies");

  if (!cookieAlert) {
    return;
  }

  cookieAlert.offsetHeight; // Force browser to trigger reflow (https://stackoverflow.com/a/39451131)

  // Show the alert if we can't find the "acceptCookies" cookie
  if (!getCookie("acceptCookies")) {
    cookieAlert.classList.add("show");
  }

  // When clicking on the agree button, create a 1 year
  // cookie to remember the user's choice and close the banner
  acceptCookies.addEventListener("click", function () {
    setCookie("acceptCookies", true, 365);
    cookieAlert.classList.remove("show");
  });

  // Cookie functions from w3schools
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
});

$(document).ready(function () {
  var playing = true;
  $(".play-pause").click(function () {
    if (playing == false) {
      document.getElementById("myVideo").play();
      playing = true;
      $(this).html("<span class='fa fa-pause'></span>");
    } else {
      document.getElementById("myVideo").pause();
      playing = false;
      $(this).html("<span class='fa fa-play'></span>");
    }
  });
});

function hasTouch() {
  return (
    "ontouchstart" in document.documentElement ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

if (hasTouch()) {
  // remove all the :hover stylesheets
  try {
    // prevent exception on browsers not supporting DOM styleSheets properly
    for (var si in document.styleSheets) {
      var styleSheet = document.styleSheets[si];
      if (!styleSheet.rules) continue;

      for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
        if (!styleSheet.rules[ri].selectorText) continue;

        if (styleSheet.rules[ri].selectorText.match(":hover")) {
          styleSheet.deleteRule(ri);
        }
      }
    }
  } catch (ex) {}
}

// keep side nav open on desktop view
// Detect screen width and remove data-bs-toggle attribute on larger screens
window.addEventListener("DOMContentLoaded", function () {
  const sidenavHeading = document.querySelector(
    ".sidenav-accordion .sidenav-heading"
  );
  const accordionMainCollapse = document.querySelector(
    ".sidenav-accordion .accordion-main-collapse"
  );

  function handleToggle() {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 991) {
      // Adjust the breakpoint as needed
      accordionMainCollapse.classList.add("show");
      sidenavHeading.removeAttribute("data-bs-toggle");
    } else {
      accordionMainCollapse.classList.remove("show");
      sidenavHeading.setAttribute("data-bs-toggle", "collapse");
    }
  }

  if (sidenavHeading) {
    handleToggle(); // Call the function on page load

    // Call the function when the window is resized
    window.addEventListener("resize", handleToggle);
  }
});

// media carousel
// $(".carousel-media").slick({
//   arrows: true,
//   dots: true,
//   infinite: true,
//   speed: 400,
//   slidesToShow: 3,
//   slidesToScroll: 1,
//   responsive: [
//     {
//       breakpoint: 991.5,
//       settings: {
//         slidesToShow: 1,
//         slidesToScroll: 1,
//       },
//     },
//   ],
// });

// News Cards Carousel
document.addEventListener("DOMContentLoaded", function () {
  // Get all carousels with the 'carousel-cards' class
  const multiCarousels = document.querySelectorAll(".carousel-cards");

  multiCarousels.forEach(carousel => {
    const carouselId = carousel.id;
    const carouselItems = carousel.querySelectorAll(".carousel-item");
    let itemWidth = carouselItems[0].clientWidth; // Width of a single item
    let slidePosition = 0; // Current position
    const itemMargin = 24; // The margin-right value between items

    // Get the prev/next buttons
    const prevButton = carousel.querySelector(".carousel-control-prev");
    const nextButton = carousel.querySelector(".carousel-control-next");
    const carouselInner = carousel.querySelector(".carousel-inner");

    // Function to slide to a specific position
    function slideTo(position) {
      // Make sure position is within bounds
      const totalItems = carouselItems.length;
      slidePosition = (position + totalItems) % totalItems;

      // Calculate the translation amount
      const translateX = -1 * slidePosition * (itemWidth + itemMargin);

      // Apply the transform to the carousel inner
      carouselInner.style.transform = `translateX(${translateX}px)`;

      // Update active class on items
      carouselItems.forEach((item, index) => {
        if (index === slidePosition) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Update active indicators
      const indicators = carousel.querySelectorAll(
        ".carousel-indicators button"
      );
      indicators.forEach((indicator, index) => {
        if (index === slidePosition) {
          indicator.classList.add("active");
          indicator.setAttribute("aria-current", "true");
        } else {
          indicator.classList.remove("active");
          indicator.setAttribute("aria-current", "false");
        }
      });
    }

    // Add click event listeners for prev/next buttons
    prevButton.addEventListener("click", function (e) {
      e.preventDefault();
      slideTo(slidePosition - 1);
    });

    nextButton.addEventListener("click", function (e) {
      e.preventDefault();
      slideTo(slidePosition + 1);
    });

    // Add click event listeners for indicators
    const indicators = carousel.querySelectorAll(".carousel-indicators button");
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", function () {
        slideTo(index);
      });
    });

    // Handle window resize to adjust item widths
    window.addEventListener("resize", function () {
      // Recalculate item width after resize
      itemWidth = carouselItems[0].clientWidth;

      // Reset transform to match new item width
      slideTo(slidePosition);
    });
  });
});

// Media Carousel
document.addEventListener("DOMContentLoaded", function () {
  const multiCarousels = document.querySelectorAll(".carousel-media");

  multiCarousels.forEach(carousel => {
    const carouselItems = carousel.querySelectorAll(".carousel-item");
    const carouselInner = carousel.querySelector(".carousel-inner");
    const prevButton = carousel.querySelector(".carousel-control-prev");
    const nextButton = carousel.querySelector(".carousel-control-next");
    const indicators = carousel.querySelectorAll(".carousel-indicators button");

    let slidePosition = 0; // Current position
    let containerWidth = carouselInner.clientWidth;

    // Function to update item widths dynamically
    function updateItemWidths() {
      containerWidth = carouselInner.clientWidth;

      const isSmallScreen = window.innerWidth <= 991.5;

      carouselItems.forEach((item, index) => {
        if (index === slidePosition) {
          item.style.flex = isSmallScreen ? "0 0 90%" : "0 0 60%"; // Active item
        } else {
          item.style.flex = isSmallScreen ? "0 0 15%" : "0 0 20%"; // Non-active items
        }
      });
    }

    // Function to slide to a specific position
    function slideTo(position) {
      const totalItems = carouselItems.length;
      slidePosition = (position + totalItems) % totalItems;

      const isSmallScreen = window.innerWidth <= 991.5;
      // Calculate the translation amount
      const translateFactor = isSmallScreen
        ? Math.max(containerWidth * 0.25, 264) / containerWidth
        : 0.25; // Use 0.25 for large screens

      // Calculate the translation amount
      const translateX =
        -1 * slidePosition * (containerWidth * translateFactor);

      // Apply the transform to the carousel inner
      carouselInner.style.transform = `translateX(${translateX}px)`;

      // Update active class on items
      carouselItems.forEach((item, index) => {
        if (index === slidePosition) {
          item.classList.add("active");
        } else {
          item.classList.remove("active");
        }
      });

      // Update active indicators
      indicators.forEach((indicator, index) => {
        if (index === slidePosition) {
          indicator.classList.add("active");
          indicator.setAttribute("aria-current", "true");
        } else {
          indicator.classList.remove("active");
          indicator.setAttribute("aria-current", "false");
        }
      });

      // Update item widths
      updateItemWidths();
    }

    // Add click event listeners for prev/next buttons
    prevButton.addEventListener("click", function (e) {
      e.preventDefault();
      slideTo(slidePosition - 1);
    });

    nextButton.addEventListener("click", function (e) {
      e.preventDefault();
      slideTo(slidePosition + 1);
    });

    // Add click event listeners for indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", function () {
        slideTo(index);
      });
    });

    // Handle window resize to adjust item widths
    window.addEventListener("resize", function () {
      updateItemWidths();
      slideTo(slidePosition); // Recalculate position after resize
    });

    // Initialize item widths and position
    updateItemWidths();
    slideTo(slidePosition);
  });
});

// Handle videos inside carousels
document.addEventListener("DOMContentLoaded", function () {
  const multiCarousels = document.querySelectorAll(".carousel-media");

  multiCarousels.forEach(carousel => {
    const carouselInner = carousel.querySelector(".carousel-inner");
    const videos = carousel.querySelectorAll(".carousel-video");
    const playPauseButtons = carousel.querySelectorAll(".video-play-pause-btn");

    // Function to pause all videos
    function pauseAllVideos() {
      videos.forEach(video => {
        video.pause();
      });
    }

    // Add event listener to play/pause buttons
    playPauseButtons.forEach(button => {
      button.addEventListener("click", function () {
        const videoId = this.getAttribute("data-video-id");
        const video = document.getElementById(videoId);

        if (video.paused) {
          video.play();
          this.innerHTML = '<span class="fa fa-pause"></span>';
        } else {
          video.pause();
          this.innerHTML = '<span class="fa fa-play"></span>';
        }
      });
    });

    // Pause all videos when the carousel slides
    carouselInner.addEventListener("transitionstart", function () {
      pauseAllVideos();
    });
  });
});
