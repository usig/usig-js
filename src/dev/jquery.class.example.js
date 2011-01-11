// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

/**
 * @class Person
 * Esta clase representa una persona<br/>
 * @namespace usig
 * @constructor 
 * @param {String} name Nombre 
*/	
usig.Person = jQuery.Class.create({
  init: function(name){
    this.name = name;
  },
  /**
   * Devuelve el nombre de la persona
   * @return {String} Nombre de la persona
   */
  sayName: function(){
    return this.name;
  }
});

/**
 * @class Ninja
 * Esta clase representa un ninja<br/>
 * @namespace usig
 * @constructor 
 * @param {String} name Nombre 
*/	
usig.Ninja = Person.extend({
  /**
   * Dice si la persona sabe blandir una espada
   * @return {Boolean} Sabe blandir una espada?
   */
  swingSword: function(){
    return true;
  }
});
