// A Service Worker that deploys an application 
// that randomly sends users to one of two web pages

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

/**
 * Respond with variant pages
 * @param {Request} request
 */

async function handleRequest(request) {
  // fetch api
  let urls = "";
  let fetched_api = await fetch("https://cfw-takehome.developers.workers.dev/api/variants");
  if (fetched_api.ok) {
    let fetched_api_json = await fetched_api.json();
    let variant = fetched_api_json['variants'];

    // make a request to one of the two URLs randomly
    // and persist the updated web page using cookies
    const cookie = request.headers.get('cookie')
    const NAME = 'ab-experiment'
    let response;
    if (cookie && cookie.includes(`${NAME}=variant-1`)) {
      urls = variant[0]
    } else if (cookie && cookie.includes(`${NAME}=variant-2`)) {
      urls = variant[1]
    } else {
      urls = Math.random() < 0.5 ? 'variant-2' : 'variant-1';
    }
    let random_url = urls === 'variant-1' ? variant[0] : variant[1];
    let final_res = await fetch(random_url);
    response = new Response(final_res.body, final_res);
    response.headers.append('Set-Cookie', `${NAME}=${urls}; path=/`)
    return new HTMLRewriter()
        .on('*', new ElementHandler(urls))
        .transform(response);
  }
}

class ElementHandler {
  constructor(elementHandler) {
    this.elementHandler = elementHandler
  }

  element(element) {
    if (element.tagName === 'title') {
      element.setInnerContent('Ademola Olokun')
    }

    if (element.tagName === 'h1' && element.getAttribute('id') === 'title') {
      if (this.elementHandler === 'variant-1') {
        element.setInnerContent("LinkedIn")
      } else {
        element.setInnerContent("Github")
      }
    }

    if (element.tagName === 'p' && element.getAttribute('id') === 'description') {
      if (this.elementHandler === 'variant-1') {
        element.setInnerContent("Take a dive into my Professional Career.")
      } else {
        element.setInnerContent("Check out some of my cool projects.")
      }
    }

    if (element.tagName === 'a' && element.getAttribute('id') === 'url') {
      element.setInnerContent("Go on and check it out!")
      if (this.elementHandler === 'variant-1') {
        element.setAttribute('href', "https://www.linkedin.com/in/ademolaolokun/")
      } else {
        element.setAttribute('href', "https://github.com/ade-mola/")
      }
    }
  }
}
