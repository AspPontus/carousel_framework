# Carousel Framework

This is a framework to help AdOps more easily create and maintain various carousels. This framework works by injecting itself into the head of the html file, which gives AdOps the ability to access the class in the JS tab and access utility methods in order to customize their carousel. This framework will also inject its own CSS file in the head of the HTML, this will have the benifit of haveing a carousel which is functional from the moment it is instanciated. This CSS file is supposed to be able to be overwritten in purpose of further customizability. To overwrite any deafault CSS simply target the element in the css as usual and write your own CSS. In some cases you may need to use the !important keyword in order for your new CSS to take proper effect, however the idea is that this should not be needed. 

## How to create a carousel:
### Create an HTML template:
  
The first this we need to do is create a HTML template for that we will use to decide how the slides are structrured. This template will be more or less normal HTML except it will be written in the JS tab within the CMS. We begin with declaring a variable that will contain our template like this:

        const template = ` ` 

**Note: these are not single quotes they are backticks, this is will be important for the next steps since neither double quotes or single quotes will allow for linebreaks which will make your template hard to read.**
  
Next we want to write our actual template here we will write regular HTML, but anywhere we want information to be dynamically updated we place a placeholder value. These values will start and end with a hashtag and should be named so that they correspond with the data you have inputed for your carousel. For example if in your data object you have a feild called title, your placeholder should be called #title#, this value will then be replaced by the title feild of the current data object.  
  
With this in mind, our template variable should look something like this:

        const template = `
            <h1 class="title" >#title#</h1>
            <img class="image" src="#img_link# />
          `


### Instantiate your carousel object:

The carousel object lives in a class by the name of Carousel. To access is we need to create an instance of this class which is typically called an object. We do this by running the following command:
`` const carousel = new Carousel(); ``
This will create a new object that we've called "carousel" and it is using the Carousel class. Our carousel class will require a few parameters to work however. There are some required parameters and there are some optional parameters

