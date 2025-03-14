# Carousel Framework

This is a framework to help AdOps more easily create and maintain various carousels. This framework works by injecting itself into the head of the html file, which gives AdOps the ability to access the class in the JS tab and access utility methods in order to customize their carousel. This framework will also inject its own CSS file in the head of the HTML, this will have the benifit of haveing a carousel which is functional from the moment it is instanciated. This CSS file is supposed to be able to be overwritten in purpose of further customizability. To overwrite any deafault CSS simply target the element in the css as usual and write your own CSS. In some cases you may need to use the !important keyword in order for your new CSS to take proper effect, however the idea is that this should not be needed. 

## How to create a carousel:

### Overview:
For this framework to work properly, it will require  a few things, these are

*  The data that will be presented in the carousel
*  An HTML template to dictate how your slides should look
*  A location where the carousel should be injected (if omitted the carousel will default to the #creative)
*  An instance of the Carousel class
  
Below I will go over a basic setup of this class.

### Carousel data

The carousel will expect to get data in JavaScript Object Notation, this is convinient when working with feeds since this is how data will be sent to the ad from the feed. The basic structure of this will be an array filled with JavaScript objects. An array can be destinguished by starting and ending with square brackets ( `` [] `` ). This essentially just denotes that this will be a list. Within this array we define objects, where each object will represent a product in the slide. An object is denoted by the curly brackets ( `` {} `` ). An object in JavaScript works on the principle of key value pairs, which means, we have one value identifying a feild, and another value displaying the value of that feild. Keys and values are seperated by a `` : `` and multiple feilds are sperated by `` , ``. All put together, a variable holding the data for a carousel should look somthing like this:

      const data = [ 
        {
          key: value,
          id: 1,
          title: "Title number 1"
        },
        {
          key: another value,
          id: 2,
          title: "Title number 2"
        },
        {
          key: a thrid value,
          id: 3,
          title: "Title number 3"
        },
      ];

This is setting up a variable with three objects that we can display in our carousel.

### HTML Template

We also need to tell our carousel what markup and styles each slide should have. We do this by defining an HTML template, with classes and id's that we can use CSS to style as usual. The template will be written in normal HTML, but it should be written in as a variable under the JS tab in the CMS. The template should also only contain static information. Anywhere you want to dynamically show information from the active slide in the carousel, you should create a placeholder. The placeholder will be the key to the value you want to replace the placeholder, encapsulated between two hashtags. As an expample, if we look at the data we put together above, if we want to have an h1 tag displaying the title in out template, we would define our h1 tag as follows `` <h1>#title#</h1> ``. This will now make sure that each active slide will show the value of the title in place of ``#title# ``. We can now use this logic to create a full template like this:

        const template = `
          <div class="container">
            <h1>#title#</h1>
            <img class="image" src="#image_link#"/>
          </div>
        `
  > **NOTE: `` ` ` `` these are not single quotes but backticks, single quotes will not work here since they will not allow linebreaks, and will make your code harder to read and work with.**

### Location

To display our carousel properly we typically want to nest it within a parent div, like a static area och a carousel container. So when we initialize out carousel we typically want to assign it a location within our code. This is however not required, if you don't define a location, the carousel will default to the #creative div and place the carousel there, this will however take up the entire carousel and is therefore not recommended. 

To define a location, you simply have to give the carousel object a parent element, in which the carousel can be placed. This is easily done like this:

        const location = document.querySelector('.static');

This will put the carousel within the div with the class `` static ``.

### Instanciating the Carousel

The last step in creating a carousel is to create an instance of the carousel class. We do this by using the `` new `` keyword in JavaScript which allows you to create a new carousel object. The carousel object will require the template we've created and the data for the carousel in order for it to be initiated. There are more optional parameters which you can use to customize the carousel. One such optional parameter is the location. It is generally recommended to assign your carousel a location, so that's what we will do. If you have created a template, data and location variable, you can then create a carousel like so:

        const carousel = new Carousel(template, data, location);
        
After saving this you should see a basic carousel.

When creating a carousel, you always have to specify a template and data, in this order. The rest of the parameters are optional, but since JavaScript is an implicit language and does not care about data types in variable declaration, and therefore does not allow overloading constructors, the order that you input parameters is crucial. You can not input the location first and then data and template, you always have to specify template first, then data, then location. This can make for some really long initializations. To help out, below I have constructed a list of the constructors parameters, in the order they need to be inputed.

* template - the HTML for each slide
* data - the actual data you want each slide to be populated with
* location - the selector of the parent to your carousel
* infinite - a true / false value to decide if your carousel should loop around to the beginning after finishing
* loop - a true / false value to decide if your carousel should automatically loop through the slides until the user interacts
* animationTimeMs - the transition time between slides in milliseconds
* intervalTimeMs - how long each slide should be shown for in milliseconds
* buttons - a true / false value to decide if there should be control buttons or not
* btnImageL - here you can input an image to replace the left control button
* btnImageR - here you can input an image to replace the right control button
* autoClickTags - will automatically increment the clicktag of each slide, so slide one is clickTag1 slide two is clickTag2 etc

Beyond this there are quite a few utility functions that can be used. I will go over what these are and how they can be used further down in this document.

## Carousel Example Code

If you followed along with the above code you should have a result looking something like this in your project:

    const data = 
    [
      {
        img_url: "https://play2.s3.amazonaws.com/assets/Hf4I_TINk.png",
        product_title: "Generic Car ST1 TEST",
        price: "182 900 kr",
        sale_price: "165 900 kr",
        url: "https://seenthis.co",
        tracking: "?ST_feed_template_car_1",
        cta: "Buy now"
      },
      {
        "img_url": "https://play2.s3.amazonaws.com/assets/jq53ArzNY.png",
        "product_title": "Generic Car ST2",
        "price": "152 900 kr",
        "sale_price": "141 900 kr",
        "url": "https://seenthis.co",
        "tracking": "?ST_feed_template_car_2",
        "cta": "Read more"
      },
      {
        img_url: "https://play2.s3.amazonaws.com/assets/iyh1g8DUb.png",
        product_title: "Generic Car ST3",
        price: "229 900 kr",
        sale_price: "212 900 kr",
        url: "https://seenthis.co",
        tracking: "?ST_feed_template_car_3",
        cta: "Learn more"
      },
    ]

    const template = const template = `
      <a href="#url##tracking#" target="_blank">
      <img class="car" src="#img_url#"/>
      <div class="info-block outside">
        <div class="info">
          <h2>#product_title#<h2>
          <h4>#price#</h4>
          <h4 class="grey">Prvious price: #sale_price#</h4>
        </div>
        <button class="cta outside">#cta#</button>
      </div>
      </a>
      `
    const location = document.querySelector('.static');
      
    const carousel = new Carousel(template, data, location);



