const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('section');
const projectsContainer = document.querySelector('.projects-grid');
const viewMoreBtn = document.querySelector('.show-more')
let currentActiveLink = document.querySelector('a.active');
let projectDataArr = [];
let displayedProjects = 3;
let allProjectsLoaded = false;
const anpArrUrl = 'anpArrays.json';

function removeActiveClass() { 
  navLinks.forEach(link => link.classList.remove('active'));
}; //Function to remove the 'active' class from all links

navLinks.forEach(link => { //Function to add hover and click behavior to the links.
  link.addEventListener('mouseenter', function() {
    if (currentActiveLink && currentActiveLink !== this) {
      currentActiveLink.classList.add('hovering-active');
    };
  });

  link.addEventListener('mouseleave', function() {
    if (currentActiveLink && currentActiveLink !== this) {
      currentActiveLink.classList.remove('hovering-active');
    };
  });

  link.addEventListener('click', function() {
    removeActiveClass();
    this.classList.add('active');
    currentActiveLink = this;
  });
});

function handleScroll() {
  let currentSection = null;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    if (window.scrollY >= sectionTop - sectionHeight / 3) {
      currentSection = section;
    };
  });
  if (currentSection) {
    const currentLink = document.querySelector(`nav ul li a[href="#${currentSection.id}"]`);
    if (currentLink !== currentActiveLink) {
      removeActiveClass();
      currentLink.classList.add('active');
      currentActiveLink = currentLink;
    };
  };
}; //Function to detect scroll and highlight the nav link corresponding to the visible section.

if ('scrollRestoration' in history) {history.scrollRestoration = 'manual';}; //Disable scroll restoration to force the browser to start at the top.
window.addEventListener('load', window.scrollTo(0, 0)); //Immediately scroll to the top after the page is fully loaded.
window.addEventListener('scroll', handleScroll); //Listen for the scroll event.

fetch(anpArrUrl).then(respond => respond.json()).then(data => {
  projectDataArr = data.projects;
  appendProjects(projectDataArr.slice(0, displayedProjects)); //Load initial 3 projects
}).catch(projectsContainer => projectsContainer.innerHTML = `<p class="error-msg">There was an error loading the projects</p>`);

//Append projects to the DOM
const appendProjects = projects => {
  projects.forEach(({ url, title }) => {const projectElement = document.createElement('a');
    projectElement.classList.add('project-link');
    projectElement.href = url;
    projectElement.target = '_blank';
    projectElement.innerHTML = `<iframe class="project" src="${url}" alt="${title}" title="${title}" loading="lazy"></iframe>
    <p><code>&lt;/</code>${title}<code>&gt;</code></p>`;
    projectsContainer.appendChild(projectElement);
  });
};

//Function to load more or fewer projects
viewMoreBtn.addEventListener('click', function toggleProjects() {
  if (allProjectsLoaded) {
    if (displayedProjects > 3) {
      removeLastProjects(3);
    }; //Remove 3 projects at a time, but stop when there are only 3 projects left.
    if (displayedProjects === 3) {
      allProjectsLoaded = false;
      viewMoreBtn.classList.remove('view-less');
      viewMoreBtn.innerHTML = '<i class="fa fa-chevron-down"></i> View More';
    }; //If only 3 projects are left, revert to "View More" mode
  } else {
    const projectsToLoad = Math.min(3, projectDataArr.length - displayedProjects); //Load 3 more projects
    appendProjects(projectDataArr.slice(displayedProjects, displayedProjects + projectsToLoad));
    displayedProjects += projectsToLoad;
    if (displayedProjects >= projectDataArr.length) {
      allProjectsLoaded = true;
      viewMoreBtn.classList.add('view-less');
      viewMoreBtn.innerHTML = '<i class="fa fa-chevron-up"></i> Show Less';
    }; //If all projects are displayed, change button to "Show Less"
  };
});

const removeLastProjects = last => {
  for (let i = 0; i < last; i++) {
    if (projectsContainer.lastChild && displayedProjects > 3) {
      projectsContainer.removeChild(projectsContainer.lastChild);
      displayedProjects--;
    };
  };
}; //Function to remove the last projects.

let quotesData;
let colors = []; //Will store colors after fetching
let currentIndex = 0; //Keep track of the current quote index
var currentQuote = '', currentAuthor = '';

async function fetchColors() {
  return fetch(anpArrUrl).then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }).then(data => {
    console.log("Data fetched from JSON:", data);
    if (data.colors) {
      colors = data.colors; //Save colors into a global variable
      return colors;
    } else {
      throw new Error("Colors array not found in JSON");
    }
  }).catch(err => {
    console.error("Error fetching colors:", err);
  })
}; //Function to fetch colors from JSON file

function getQuotes() {
  return $.ajax({
    headers: {Accept: 'json'},
    url: anpArrUrl,
    success: function (jsonQuotes) {
      if (typeof jsonQuotes === 'string') {
        quotesData = JSON.parse(jsonQuotes);
      } else {
        quotesData = jsonQuotes;
      };
    }
  });
};

function getRandomQuote() {
  return quotesData.quotes[Math.floor(Math.random() * quotesData.quotes.length)];
};

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
};

function getQuote() {
  let randomQuote = getRandomQuote();
  currentQuote = randomQuote.quote;
  currentAuthor = randomQuote.author;

  let randomColor = getRandomColor(); //Apply random color

  $('#pinterest-quote').attr('href',
    'https://pinterest.com/pin/create/button/?url=' +
    encodeURIComponent(currentQuote + ' - ' + currentAuthor)
  );

  $('#tweet-quote').attr('href',
    'https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=' +
    encodeURIComponent('"' + currentQuote + '" ' + currentAuthor)
  );

  $('#tumblr-quote').attr('href',
    'https://www.tumblr.com/widgets/share/tool?posttype=quote&tags=quotes,freecodecamp&caption=' +
    encodeURIComponent(currentAuthor) + '&content=' +
    encodeURIComponent(currentQuote) +
    '&canonicalUrl=https%3A%2F%2Fwww.tumblr.com%2Fbuttons&shareSource=tumblr_share_button'
  );

  $('.quote-text').animate({ opacity: 0 }, 500, function () {
    $(this).animate({ opacity: 1 }, 500);
    $('#text').text(randomQuote.quote);
  });

  $('.quote-author').animate({ opacity: 0 }, 500, function () {
    $(this).animate({ opacity: 1 }, 500);
    $('#author').html(randomQuote.author);
  });
  //Change background color and text color
  $('#quote-box').animate({ backgroundColor: randomColor, color: randomColor}, 1000);
  $('.button').animate({color: randomColor}, 1000);
};

//Function to display a quote based on index
const displayQuote = index => {
  if (!quotesData || !quotesData.quotes || index < 0 || index >= quotesData.quotes.length) {
    console.error("Invalid index or quotes data not available");
    return;
  }

  let quoteObj = quotesData.quotes[index];
  currentQuote = quoteObj.quote;
  currentAuthor = quoteObj.author;

  let randomColor = getRandomColor(); // Apply random color

  $('#pinterest-quote').attr('href',
    'https://pinterest.com/pin/create/button/?url=' +
    encodeURIComponent(currentQuote + ' - ' + currentAuthor)
  );

  $('#tweet-quote').attr('href',
    'https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=' +
    encodeURIComponent('"' + currentQuote + '" ' + currentAuthor)
  );

  $('#tumblr-quote').attr('href',
    'https://www.tumblr.com/widgets/share/tool?posttype=quote&tags=quotes,freecodecamp&caption=' +
    encodeURIComponent(currentAuthor) + '&content=' +
    encodeURIComponent(currentQuote) +
    '&canonicalUrl=https%3A%2F%2Fwww.tumblr.com%2Fbuttons&shareSource=tumblr_share_button'
  );

  $('.quote-text').animate({ opacity: 0 }, 500, function () {
    $(this).animate({ opacity: 1 }, 500);
    $('#text').text(currentQuote);
  });

  $('.quote-author').animate({ opacity: 0 }, 500, function () {
    $(this).animate({ opacity: 1 }, 500);
    $('#author').html(currentAuthor);
  });

  //Change background color and text color
  $('#quote-box').animate({backgroundColor: randomColor, color: randomColor}, 1000);
  $('.button').animate({color: randomColor}, 1000);
};

function showNextQuote() {
  currentIndex = (currentIndex + 1) % quotesData.quotes.length; // Increment index and loop
  displayQuote(currentIndex);
}; //Function to handle next quote


function showPreviousQuote() {
  currentIndex = (currentIndex - 1 + quotesData.quotes.length) % quotesData.quotes.length; // Decrement index and loop
  displayQuote(currentIndex);
}; //Function to handle previous quote

//On document ready, load quotes and colors
$(document).ready(function () {
  Promise.all([getQuotes(), fetchColors()]).then(() => {
    displayQuote(currentIndex); //Display the first quote
  });
  //Event listeners for next and previous buttons
  $('#next-quote').on('click', showNextQuote);
  $('#previous-quote').on('click', showPreviousQuote);
});

const fbBtn = document.getElementById('facebook-quote').onclick = function shareQuoteToFacebook() {
  let textToCopy = '"' + currentQuote + '" - ' + currentAuthor;
  navigator.clipboard.writeText(textToCopy).then(function() {
    alert('Quote copied to clipboard! Now you can paste it in your Facebook post.');
  }, function(err) {
    console.error('Could not copy text: ', err);
  });
  window.open('https://www.facebook.com/sharer/sharer.php?u=https://andreninpad.github.io/portfolio', '_blank'); //Open the Facebook share dialog
};

const linkedinBtn = document.getElementById('linkedin-quote').onclick = function shareQuoteToLinkedIn() {
  let textToCopy = '"' + currentQuote + '" - ' + currentAuthor;
  navigator.clipboard.writeText(textToCopy).then(function() {
      alert('Quote copied to clipboard! Paste it in your LinkedIn post.');
  }, function(err) {
      console.error('Could not copy text: ', err);
  });
  window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://andreninpad.github.io/portfolio', '_blank'); //Open the LinkedIn share dialog
};

$(document).ready(function () {
  Promise.all([getQuotes(), fetchColors()]).then(() => {
    getQuote(); //Display the first quote and random color
  }); //Fetch quotes and colors, then display the first quote
  $('#new-quote').on('click', getQuote); //Event listener for "New Quote" button
});