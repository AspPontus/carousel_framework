
/**
 * This creates a carousel object that can be manipulated
 * @params: template, location, data, transitionTimeMs, intervalTimeMs, loop, infinite, BtnImageL, BtnImageR, buttons
 */
class Carousel {
  Template; // - Takes in an HTML template for each product (required)
  Location; // - Takes in a location for where to inject the carousel (Defaults to #creative)
  Data = []; // - Takes in an object with data, object names should be the same as placeholders in template
  AnimationTimeMs; // - Takes in the transition time of an animation in ms (Default 500)
  IntervalTimeMs; // - Takes in the interval time between slides incase of loop being true (Default 2500)
  Loop = true; // - Takes in a value to say if the carousel should auto loop (Default true)
  Infinite = true; // - Takes in a value to say if the carousel should be infinite (Deafult true);
  Buttons = true; // - Parameter to signal if the buttons should be visible (Default true)
  BtnImageL = null; // - Takes in an image url for the left button
  BtnImageR = null; // - Takes in an image url for the right button
  AutoClickTags = true; // - Parameter to signal if the class should automaticaly assign areas clickTags

  ActiveTransformAxis = 'X';
  InactiveTransformAxis = 'Y';
  ReversedDirection = false;
  CircularCarousel = false;
  
  // TODO: fix this, maybe put it as a class instead?
  HorizontalBtnCSS = `.carousel-btn{position: absolute;top: 0;left: 0;height: 100%;width: 60px;z-index: 1000;transition: .3s;display: flex;justify-content: center;align-items: center;font-size: 42px;}.carousel-btn:hover{transform: scale(1.1);}#next-btn {left: auto;right: 0;}`
  VerticalBtnCSS = `.carousel-btn{position: absolute;bottom: 0;left: 50%;height: 60px;width: 60px;z-index: 1000;transition: .3s;display: flex;justify-content: center;align-items: center;font-size: 42px; transform: translate(-50%) rotate(-90deg);}.carousel-btn:hover{transform: translate(-50%) scale(1.1) rotate(-90deg);}#next-btn {top:0;bottom:auto;}`
  BtnCSS = this.HorizontalBtnCSS;

  ReverseBtns = false;

  NeighbourElementProperties = {
    translateX: 100,
    translateY: -20,
    scale: 1.0,
    opacity: 1,
  }


  // Private properties
  PlaceholderVals = []; // - Stores all the found placeholders found in the template
  ActiveIndex = 0; // - Stores the active index for the carousel
  Running = false; // - Stores a value signaling if a slide animation is currently running
  Interval; // - Holds the inderval for the autoloop, this is used to clear the running loop
  TrackedEvents = []; // - keep track of tracked custom events so we dont track them multiple times

  Stylesheet = document.createElement('style');

  OutsideOfSliderEl = [];
  ClickTag = 'clickTag1';
  
  
  constructor(
    template,
    data = [],
    location = document.querySelector("#creative"),
    infinite = true,
    loop = true,
    animationTimeMs = 500,
    intervalTimeMs = 2500,
    buttons = true,
    btnImageL = null,
    btnImageR = null,
    autoClickTags = true,){
    this.Template = template;
    this.Location = location;
    this.Infinite = infinite;
    this.Data = data;
    this.AnimationTimeMs = animationTimeMs;
    this.IntervalTimeMs = intervalTimeMs;
    this.Loop = loop;
    this.Buttons = buttons;
    this.AutoClickTags = autoClickTags;
    this.BtnImageL = btnImageL;
    this.BtnImageR = btnImageR;

    this.ParseTemplate();
    this.InjectCarousel();
    this.AddAllProds();
    this.ClickEventObserver();
    this.Loop ? this.LoopCarousel() : '';
    this.InjectStyles();
    this.MoveElementsOut();

    this.NeighbourElements = new Proxy(this.NeighbourElementProperties, {
      set: (target, key, value) => {
        this.OnChange(key, value);
        target[key] = value;
        return true;
      }
    });
  }

  // Parses the tamplate to sniff out the placeholder values in order to replace them later
  ParseTemplate = () => {
    const regex = /#([a-zA-Z0-9_-]+)#/g; // Checks for a placeholder value between two #
    const res = [...this.Template.matchAll(regex)]; // Save all matched values to res
    res.forEach(placeholder => { // Loop over each found placeholder
      this.PlaceholderVals.push(placeholder[1]); // Add it to the placeholder array
    })

    const findStaticClass = /class\s*=\s*"([^"]*\boutside\b[^"]*)"/g
    const resClassListString = [...this.Template.matchAll(findStaticClass)];

    resClassListString.forEach(elementClassList => {
      this.OutsideOfSliderEl.push(elementClassList[0].replaceAll('class=', '').replaceAll('"', ''))
    })
  }

  // Inject the carousel container into the html code
  InjectCarousel = () => {
    const carouselElement = document.createElement("section"); // create a carousel element container
    carouselElement.setAttribute("id", "carousel") // assign it th id "carousel"
    const carouselInner = document.createElement("section"); // create the inner carousel wrapper
    carouselInner.setAttribute("id", "carousel-inner") // assign it the id "carousel-inner"
    this.Location.appendChild(carouselElement); // append the carousel to the html at the specified location
    carouselElement.appendChild(carouselInner); // append the inner carousel as a child to the outer carousel
    if (!this.Buttons) return; // if there are not supposed to be any buttons, return this func here
    carouselElement.appendChild(this.CreateButtons('prev-btn')); // append #prev-btn element
    carouselElement.appendChild(this.CreateButtons('next-btn')); // append #next-btn element    
  }

  // Create button elements
  CreateButtons = (id) => {
    const btn = document.createElement('div'); // create a container div for the button
    btn.setAttribute("id", id); // assign it an id with the same value as the parameter
    btn.classList.add("carousel-btn"); // add a genereic carousel-btn class
    const className = `${id === "next-btn" ? 'next-carousel-btn' : 'prev-carousel-btn'}`
    if (this.BtnImageL == null && this.BtnImageR == null)
      btn.innerHTML = id === "next-btn" ? '&#10095;' : '&#10094;' // depending on the id give it an entity
    else if (this.BtnImageL != null && this.BtnImageR != null) {
      const src = id === "next-btn" ? this.BtnImageR : this.BtnImageL; 
      this.CreateImageElement(btn, className, src);
    }
    else if (this.BtnImageL != null) {
      const src = this.BtnImageL; 
      this.CreateImageElement(btn, className, src);
    }
    else if (this.BtnImageR != null) {
      const src = this.BtnImageR; 
      this.CreateImageElement(btn, className, src);
    }
    return btn; // return the created value
  }

  SetBtnImageR = (src) => {
    document.querySelector('#carousel').remove()
    this.BtnImageR = src;
    this.InjectCarousel();
    this.AddAllProds();
    this.MoveElementsOut();
  }

  SetBtnImageL = (src) => {
    document.querySelector('#carousel').remove()
    this.BtnImageL = src;
    this.InjectCarousel();
    this.AddAllProds();
    this.MoveElementsOut();
  }

  CreateImageElement = (parent, className, src) => {
      const image = new Image();
      image.classList.add(`${className}`)
      image.style.maxWidth = '100%';
      image.style.maxHeight = '100%';
      image.src = src; 
      parent.appendChild(image);
  }

  // Add all exisiting products to the carousel
  AddAllProds = () => {
    this.Data.forEach(prod => { // loop over all the existing values
      this.BuildProduct(prod) // run build product on each value independantly
    })
    this.InitSlideStates(); // once all products are loaded in, initialize state class (active, prev or next)
    // ^^^ this gets added based on each products current location ^^^
  }

  // Add a single product after carousel initilazation
  AddProd = (prod) => {
    this.BuildProduct(prod); // Build product
    this.InitSlideStates(); // Re-initialize states
    this.MoveElementsOut();
  }

  // Build each product into a html value, replace placeholder values in the template with data
  BuildProduct = (prod) => {
    let temp = this.Template; // load in template
    this.PlaceholderVals.forEach(val => { // loop over each placeholder
      let updatedTemp = temp.replaceAll(`#${val}#`, prod[val]); // replace current placeholder value
      temp = updatedTemp; // update the template so that we dont forget values
    }) 
    this.InjectProduct(temp); // inject the product into the carousel
  }

  // Injects each product into the carousel container
  InjectProduct = (html) => {
    const wrapper = document.createElement('div'); // creates the wrapper for the product
    wrapper.classList.add('prod-wrapper') // adds the prod-wrapper class to the element
    const prod = document.createElement('div'); // created the prod element container (remove?)
    prod.classList.add('prod-inner'); // gives the prod element the prod-inner class
    prod.innerHTML = html; // inputs the correct template html into the prod
    
    document.querySelector('#carousel-inner').appendChild(wrapper); // appends the wrapper to the carousel
    wrapper.appendChild(prod); // appends the prod in the wrapper
  }

  // Gives each slide its appropriate state based on position
  InitSlideStates = () => {
    this.ClearStates(); // Clear previous states if they exist
    const prods = document.querySelectorAll('.prod-wrapper'); // get all products 
    prods[0].classList.add('active'); // give index 0 the active state
    prods[1].classList.add('next'); // give index 1 the next state
    prods[prods.length - 1].classList.add('prev'); // give the last index the prev state
    setTimeout(() => {
      prods[0].classList.add('prod-slide-out'); // add the slide-out animation to the active state
    }, this.AnimationTimeMs); // this needs to be in a timeout to not clear itself after its assigned
  }

  // Checks so that the new index is within bounds
  CheckActiveIndex = (infinite) => {
    const prods = document.querySelectorAll('.prod-wrapper'); // Fetches all existing prods
    if (this.ActiveIndex < 0 && infinite) // if active index is less than 0 and supposed to be infinite
      this.ActiveIndex = prods.length - 1 // set active index to the last index instead
    else if (this.ActiveIndex > prods.length - 1 && infinite) // if active index is larger than last index
      this.ActiveIndex = 0 // assign the active index to 0
    else if (this.ActiveIndex < 0 && !infinite) // if index is less than 0 and not supposed to be infinite
      this.ActiveIndex = 0; // always update decrement to 0
    else if (this.ActiveIndex > prods.length - 1 && !infinite) // if index is larger than last index
      this.ActiveIndex = prods.length - 1; // always update increment to last index 
  }

  // Checks the index above and below the inputed index to make sure theyre within bounds
  CheckSurroundingIndecies = (index) => {
    const lastIndex = document.querySelectorAll('.prod-wrapper').length - 1; // get the last index
    if (index < 0) // if index is less than 0
      return lastIndex // return the last index
    else if (index > lastIndex) // if index is greater than the last index
      return  0; // return 0
    else // if none of the above 
      return index // return the index as is
  }

  // Locks controls while animation is running, to not break animation
  RunningAnimation = () => {
    this.Running = true; // set is running to true, signaling animation is running
    setTimeout(() => { // start a timer
      this.Running = false; // when timer is up, release controls by setting running to false
    }, this.AnimationTimeMs) // set the delay of the timer to the length of the animation
  }

  // Listens to clicks over the entire ad and evaluates what to do
  ClickEventObserver = () => { 
    document.body.addEventListener('click', (e) => { // listen for global clicks
      if((e.target.id === "next-btn" || e.target.classList.contains('next-carousel-btn')) && !this.Running) { // if click on the next-btn and running = false
        this.TrackEvent('scroll-section-1'); // track generall ad ineraction
        this.RunningAnimation(); // lock controls
        clearInterval(this.Interval); // remove auto loop if it was present
        if (this.ReverseBtns)
          this.UpdateSlide(false); // update slides to the next slide
        else
          this.UpdateSlide(true); // update slides to the next slide
        this.TrackEvent('scroll-section-2'); // track a next-btn click
      } else if((e.target.id === "prev-btn" || e.target.classList.contains('prev-carousel-btn')) && !this.Running) { // if click on the prev-btn and running = false
        this.TrackEvent('scroll-section-1'); // track generall ad ineraction
        this.RunningAnimation(); // lock controls
        clearInterval(this.Interval);  // remove auto loop if it was present
        if (this.ReverseBtns)
          this.UpdateSlide(true); // update slides to the prev slide
        else
          this.UpdateSlide(false);

        this.TrackEvent('scroll-section-3'); // track a prev-btn click
      }
      if (!this.AutoClickTags) return; // if AutoClickTags has been deselected return here

      if(!document.querySelector('#carousel').contains(e.target)) { // if click outside of the carousel
        if(e.button !== 2 && !e.target.classList.contains('carousel-btn')) { // and click is not on a control
          this.TrackEvent('scroll-section-1'); // track general interaction
          window.openLink(`clickTag1`); // open clickTag1
        }
        return; // dont continue beyond this
      }

      // if click within the carousel and not on a control button
      if(e.button !== 2 && !e.target.classList.contains('carousel-btn')) { 
        /* this.TrackEvent('scroll-section-1'); // track general interaction
        this.TrackEvent('scroll-section-4'); // track product clickout
        window.openLink(`clickTag${this.ActiveIndex + 2}`);  */

        this.ClickTag = `clickTag${this.ActiveIndex + 2}`;
        // ^^^ open the clicktag that corresponds to activeindex +2 ^^^
        return; // dont continue beyond this
      }
    })
  }

  GetClickTag = (offset) => {
    this.ClickTag = `clickTag${(this.ActiveIndex + 2) + offset}`;
    return this.ClickTag;
  }

  ClearStates = () => {
    document.querySelector('.active')?.classList.remove('active');
    document.querySelector('.next')?.classList.remove('next');
    document.querySelector('.prev')?.classList.remove('prev');
    setTimeout(() => {
      document.querySelector('.prod-slide-out')?.classList.remove('prod-slide-out');
    }, this.AnimationTimeMs);
  }

  UpdateSlide = (direction) => {
    this.ClearStates();
    
     
    direction ? this.ActiveIndex++ : this.ActiveIndex--;
    this.CheckActiveIndex(this.Infinite);

    const prods = document.querySelectorAll('.prod-wrapper');

    prods[this.CheckSurroundingIndecies(this.ActiveIndex +1)].classList.add('next');
    prods[this.CheckSurroundingIndecies(this.ActiveIndex -1)].classList.add('prev');
    prods[this.ActiveIndex].classList.add('active');
    setTimeout(() => {
      prods[this.ActiveIndex].classList.add('prod-slide-out');
    }, this.AnimationTimeMs);
    this.StaticElementClasses();
  }

  LoopCarousel = () => {
    this.Interval = setInterval(() => {
      this.UpdateSlide(true);
    }, this.IntervalTimeMs)
  }

  TrackEvent = (e) => {
    if (this.TrackedEvents.includes(e)) return;
    trackCustomEvent(e);
    this.TrackedEvents.push(e);
  }

  MoveElementsOut = () => {
    if (this.OutsideOfSliderEl.length <= 0) return;
    this.OutsideOfSliderEl.forEach(el => {
      const outside = document.querySelector('#carousel').querySelectorAll(`.${el.replaceAll(' ', '.')}`)
      outside.forEach((outside, index) => {
        outside.classList.add(`showItem-${index}`)
        outside.classList.add(`${index === 0 ? `showActiveElement` : `hideActiveElement`}`)
        document.querySelector('#carousel-inner').appendChild(outside)
      })
    })
  }

  StaticElementClasses = () => {
    const elementsA = document.querySelectorAll('.showActiveElement')
    elementsA.forEach(el => {
      el?.classList.remove('showActiveElement');
    })

    const elementsB =  document.querySelectorAll(`.showItem-${this.ActiveIndex}`)
    elementsB.forEach(el => {
      el?.classList.add('showActiveElement');
    })
  }

  SetAsHorizontal = () => {
    this.Stylesheet.remove();
    this.ActiveTransformAxis = 'X';
    this.InactiveTransformAxis = 'Y';
    this.BtnCSS = this.HorizontalBtnCSS;
    this.InjectStyles();
  }

  SetAsVertical = () => {
    this.Stylesheet.remove();
    this.ActiveTransformAxis = 'Y';
    this.InactiveTransformAxis = 'X';
    this.BtnCSS = this.VerticalBtnCSS;
    this.InjectStyles();
  }

  ReverseDirection = () => {
    this.Stylesheet.remove();
    this.ReversedDirection = !this.ReversedDirection;
    this.InjectStyles();
  }

  ReverseClickDirection = () => {
    this.ReverseBtns = !this.ReverseBtns;
  }

  OnChange(key, value) {
    this.Stylesheet.remove();
    this.NeighbourElementProperties[`${key}`] = value;
    this.InjectStyles();
  }

  EnableCircularCarousel = () => {
    this.Stylesheet.remove();
    this.CircularCarousel = true;
    this.InjectStyles();
  }

  DisableCircularCarousel = () => {
    this.Stylesheet.remove();
    this.CircularCarousel = false;
    this.InjectStyles();
  }

  InjectStyles = () => {
    const source = `
    #carousel{position: relative;width: 100%;height: 100%;overflow:hidden;}#carousel-inner{position: relative;width: 100%;height: 100%;}${this.BtnCSS}.prod-wrapper{position: absolute;width: 100%;height: 100%;justify-content: center;align-items: center;display: none;}.prod-inner{position: relative;width: 100%;height: 100%;}.prod-wrapper.active, .prod-slide-out{transition: ${this.AnimationTimeMs / 1000}s; z-index:999;}.prod-wrapper.active, .prod-wrapper.prev,.prod-wrapper.next{display: flex;}.prod-wrapper.next{transform: translate${this.ActiveTransformAxis}(${this.ReversedDirection ? '-' : ''}${this.NeighbourElementProperties.translateX}%) translate${this.InactiveTransformAxis}(${this.NeighbourElementProperties.translateY}%) scale(${this.NeighbourElementProperties.scale});}.prod-wrapper.prev{transform: translate${this.ActiveTransformAxis}(${this.ReversedDirection ? '' : '-'}${this.NeighbourElementProperties.translateX}%) translate${this.InactiveTransformAxis}(${this.NeighbourElementProperties.translateY}%) scale(${this.NeighbourElementProperties.scale});}.outside{position: absolute;display: none !important;}.outside.showActiveElement{display: block !important;}.prod-wrapper.prev,.prod-wrapper.next{opacity: ${this.NeighbourElementProperties.opacity};}${this.CircularCarousel ? `.prod-wrapper.active, .prod-wrapper.prev,.prod-wrapper.next{transition: ${this.AnimationTimeMs / 1000}s}` : ''}`

  this.Stylesheet.textContent = source;
  document.head.append(this.Stylesheet);
  }
}