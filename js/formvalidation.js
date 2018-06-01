(function($){
	function Field(name, label, element){
		this.name = name;
		this.label = label;
		this.rules = [];
		this.element = element;
		this.errors = [];
		this.messages = {
				"required": "The {field} field is required.",
				"min_length": "The {field} field must be more than {val} characters long.",
				"max_length": "The {field} field must be less than {val} characters long.",
				"exact_length": "The {field} field must be exactly {val} characters long.",
				"alpha": "The {field} field can only contain alphabetical characters.",
				"alpha_numeric": "The {field} field can only contain alphanumeric characters.",
				"alpha_numeric_spaces": "The {field} field can only contain alphanumeric characters and spaces.",
				"alpha_numeric_dashes": "The {field} field can only contain alphanumeric characters and dashes.",
				"is_numeric": "The {field} field can only contain numeric characters.",
				"valid_email": "The {field} field must contain a valid email address.",
				"valid_url": "The {field} field must contain a valid URL.",
				"matches": "The {field} field must contain the same value as the {val} field!"
		}
		//Validate the current field based on the rules specified in it's data-validate attribute
		this.validate = function(){ 
			var field = this;
			$.each(this.rules, function(key, rule){
				//Skip if the field is blank and is not required
				if(field.element.val() === '' && !field.element.data('validate').includes("required")){
					return true;
				}
				//Call the function corresponding to the given rule
				console.log(rule._length);
				var result = window[rule._function](...[field.element.val(), rule._length]);
				var msg = field.getMessage(rule._function, rule._length); //Parse the corresponding error message with the field label and the parameter given
				//Check the result of the function call, if failed, add the message retrieved above to the field's error array
				if(!result){
					if(!field.errors.includes(msg)){
						field.errors.push(msg);
					}
				} else {
					//The function passed so remove any errors corresponding to the rule that previously existed in the fields error array
					field.errors = $.grep(field.errors, function(value) {
					  return value != msg;
					});
				}
			})
		} 
		//Parse an error message with the rule and parameter
		this.getMessage = function(rule, length){
			var output = this.messages[rule].replace("{field}", this.label.text());
			if(typeof length !== 'undefined' && length != null)
				output = output.replace("{val}", length);
			return output;
		}
		//Color the field's input red and add an error message to the field element's parent div if one doesn't already exist. if it does exist, change the text of it.
		this.populateError = function(){
			this.element.addClass('is-invalid').removeClass('is-valid');
			if(this.element.parent().find('div[class="invalid-feedback"]').length > 0){
				this.element.parent().find('div[class="invalid-feedback"]').first().text(this.errors[0]);
			} else {
				var errorDiv = $('<div></div>').addClass('invalid-feedback').text(this.errors[0]).hide();
				this.element.parent().append(errorDiv);
				errorDiv.fadeIn(600);
			}
		}
		//Remove the error feedback div from the field input's parent and color the input green
		this.removeError = function(){
			this.element.addClass('is-valid').removeClass('is-invalid');
			if(this.element.parent().find('div[class="invalid-feedback"]').length > 0){
				this.element.parent().find('div[class="invalid-feedback"]').first().remove();
			}
		}
		//Populate the field's rules and their parameters(if any exist) into an easy to read array
		var rules = this.element.data('validate').split('|');  //0=min_length[4], 1=min_length, 2=4
		for(var i = 0; i < rules.length; i++){
			var rule = rules[i].match(/(\w+)\s?(?:\[([^\]]+)\])?/)
			this.rules.push({
					_function: rule[1],
					_length: rule[2],
					message: this.getMessage(rule[1], rules[2]),
					value: this.element.val()
			});
		}
	}
	//Iterate through all elements that contain a data-validate attribute and put them into an array
	fields = [];
	$('[data-validate]').each(function(index, value){
		var field = new Field( //Put each field into a field object
				$(this).attr("name"), 
				$(this).parent().find('label').first(),
				$(this)
		);
		//Call the validation process whenever the value of a field is changed.
		field.element.on('input blur', function(){
			field.validate();
			if(field.errors.length > 0){
				field.populateError();
			} else {
				field.removeError();
			}
		})
		fields.push(field);
	});
	//Make sure all fields are valid before submitting the form
	$(document).on('click', '[data-submit]', function(e){
		var errorCount = 0; //Keep track of all the errors in the form
		$.each(fields, function(k, field){ //Iterate through all the fields and validate them
			field.validate();
			if(field.errors.length > 0){ //Check if there were any errors in the field
				//IF there were errors, add the error message to the field
				field.populateError();
				errorCount++;
			} else {
				//If there were no errors, remove the error message from the field
				field.removeError();
			}
		})
		//If there are errors in the form, say so. If there were no errors, we're good to go!
		if(errorCount > 0){
			var errorMsg = $('#error_message').text("You have some fields that need tending to.").hide();
			errorMsg.fadeIn(800);
			// alert("You have some fields that need tending to.");
		} else {
			var successMsg = $('#error_message').text("Thanks for the submission!");
			var contactform = document.getElementById('contactform');
			contactform.submit();
		}
		e.preventDefault();
	});
	window.required = function(str){
		return str.length > 0;
	}
	window.min_length = function(str, val){
		return val <= str.length;
	}
	window.max_length = function(str, val){
		return val >= str.length;
	}
	window.exact_length = function(str, val){
		return val == str.length;
	}
	window.alpha = function(str){
		return /^[a-zA-Z]+$/.test(str);
	}
	window.alpha_numeric = function(str){
		return (/^[a-zA-Z0-9]+$/.test(str));
	}
	window.alpha_numeric_spaces = function(str){
		return (/^[a-zA-Z ]+$/.test(str));
	}
	window.alpha_numeric_dashes = function(str){
		return /^[a-zA-Z-]+$/.test(str);
	}
	window.is_numeric = function(str){
		return /^[0-9]+$/.test(str);
	}
	window.valid_email = function(str) {
		 var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(str);
	}
	window.valid_url = function(str){
		var reg = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
		var regex = new RegExp(reg);
	     return regex.test(str);    
	}
	window.matches = function(str, val){
		return str == $('input[name="'+val+'"]').val();
	}
	
})(jQuery);

