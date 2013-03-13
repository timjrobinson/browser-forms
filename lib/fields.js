var fields = require('forms/lib/fields');

// Selectors Level 2 working draft:
// http://www.w3.org/TR/selectors-api2/#matches
var matches = function (element, selector) {
  // TODO: polyfill
  return element.webkitMatchesSelector(selector);
};

var closest = function (element, selector) {
  do {
    if(matches(element, selector)) return element;
  } while (element = element.parentElement);
  return null;
};

var mix = function (into, from) {
  Object.keys(from).forEach(function (key) {
    into[key] = from[key];
  });
  return into;
};

var attachableField = {},
    attachedField = {};

var ATTACH_DEFAULTS = {
  fieldElement: '.field',
  errorClass: 'error',
  errorMessageElement: '.error_msg'
};
attachableField.attach = function (widget, options) {
  var field = this;
  if(options) {
    options = mix(Object.create(ATTACH_DEFAULTS), options);
  } else {
    options = ATTACH_DEFAULTS;
  }
  var attached = mix(Object.create(this), attachedField);
  attached.options = options;
  attached.fieldElement = closest(widget.element, options.fieldElement);
  attached.errorMessageElement = attached.fieldElement.querySelector(options.errorMessageElement);
  mix(attached, attachedField);

  widget.on('change', function() {
    field.bind(widget.value).validate(null, function(err, boundField) {
      var message = boundField.error;
      if(message) {
        attached.showError(message);
      } else {
        attached.clearError();
      }
    });
  });

  return attached;
};
// Overridden to always create the wrapper
attachableField.errorHTML = function () {
  return '<p class="error_msg">' + (this.error || '') + '</p>';
}

attachedField.showError = function (message) {
  this.fieldElement.classList.add(this.options.errorClass);
  this.errorMessageElement.innerHTML = message;
};

attachedField.clearError = function () {
  this.fieldElement.classList.remove(this.options.errorClass);
  this.errorMessageElement.innerHTML = '';
};

// Mix attachableField into all fields
Object.keys(fields).forEach(function (fieldType) {
  module.exports[fieldType] = function() {
    var field = fields[fieldType].apply(null, arguments);
    mix(field, attachableField);
    return field
  };
});