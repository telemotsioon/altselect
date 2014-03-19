/*
	altSelect
	by villu@telemotsioon.ee
	2012 - 2014
	be nice
*/

(function($){ 
	// don't run when user is on a mobile device
	var mobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|iemobile|palm/i.test(navigator.userAgent.toLowerCase()));  
    if (mobile) return;
	
	var defaults = {  
		open: 'show', // open animation
		close: 'hide', // close animation
		select: 'hide', // select animation
		nomatch: 'No matches found', // keyboard-powered search if no matches found
		multipleTitle: '%t <em>+ %l more</em>', // multiple selections, default text
		multipleTitleNone: '<em>None selected</em>', //multiple selections, no selections at all
		multipleTitleOne: '%t', // multiple selections, only one is selected
		multipleTitleSeparator: ', ' // multiple selections separator
	};
	
	/* 
		%t = first active selection option text
		%n = number of selected options
		%l = number of selected options - 1
		%a = all selected options text
	*/
	
	var methods = {
		init : function(options) { 
			
			var options = $.extend(defaults, options);
			
			return this.each(function() {  
				
				/* if altselect is already applied, bounce back */
				if($(this).hasClass('hasAltSelect')) return;
				
				var obj = $(this);
				
				/* CREATE a.altselect */
				var title = '';
				
				if(obj.attr('multiple')) {
					
					var name = $('option:selected:first', obj).text();
					var length = $('option:selected', obj).length;
					var selected = '';
					var i = 0;
					
					$('option:selected', obj).each(function() {
						if(i == 0) selected += $(this).text();	
						else selected += options.multipleTitleSeparator + $(this).text();
						i++;
					});
					
					if(length == 1) title = options.multipleTitleOne;
					else if(length == 0) title = options.multipleTitleNone;
					else title = options.multipleTitle;
					
					title = title.replace("%t", name).replace("%n", length).replace("%l", length - 1).replace("%a", selected);
					
				} else {
					
					if($(obj)[0].selectedIndex) title = $('option:selected', obj).text();
					else title = $('option:first', obj).text();
					
				}
				
				title = $('<span />').html(title);
				
				var selectLabel = $('<a />').attr('tabindex', '0').addClass('altselect').html(title);
				
				/* check if defined */
				var numRand = Math.floor(Math.random()*10000) + 1;
				selectLabel.attr('data-id', numRand);
				
				/* copy style-tag from select to a.altselect */
				if(obj.attr('style')) selectLabel.attr('style', obj.attr('style'));
				
				/* copy class-tag from select to a.altselect */
				if(obj.attr('class')) selectLabel.addClass(obj.attr('class'));
				
				/* INSERT a.altselect TO DOM */
				obj.before(selectLabel);
				
				
				/* INTERACTION WITH a.altselect */
				
				/* make arrow up, down and enter to open altSelect/trigger click */
				selectLabel.keydown(function(e) {
											 
					if (e == null) keycode = e.keyCode;
					else keycode = e.which;
					
					if(keycode == 13 || keycode == 38  || keycode == 40) selectLabel.trigger('click');
					
				});
				
				/* INTERACTION: CLICK on a.altselect */
				selectLabel.bind('click', function(e, param) {

					e.preventDefault();
					/* Was it obj who triggered click? */
					
					/* Maybe it's already open? Check if ul.altselect exists and check its parent */
					if($('#altselect').length && $('#altselect').attr('data-parent') == $(this).attr('data-id')) return;

					if(param == 'clicked') {

						/* YES IT WAS. onclick on obj has already been triggered, so it's safe to continue */
						
						/* REMOVE other instances of ul.altselect */
						$('#altselect')[options.close]().remove();
						
						/* MAKE triggerer active */
						selectLabel.addClass('active');
						
						/* CREATE options */
						var select = $('<ul />').attr('id', 'altselect');
						
						select.attr('data-parent', $(this).attr('data-id'));
						
						if(obj.attr('class')) select.attr('class', $(this).attr('class'));
						
						if(obj.attr('title')) select.attr('title', $(this).attr('title'));
						
						if(obj.attr('style')) select.attr('style', $(this).attr('style'));
						
						if(obj.attr('disabled')) select.addClass('disabled');
						if(obj.attr('multiple')) select.addClass('multiple');
						
						select.hide();
						
						obj.children().each(function() {
						
							if($(this).get(0).tagName.toLowerCase() == 'optgroup') {
								
								var optGroupLabel = $('<li>').html($('<span>').addClass('label').text($(this).attr('label'))).appendTo(select);
			
								if($(this).attr('disabled')) optGroupLabel.addClass('disabled');
								
								var optGroup = $('<ul />').appendTo(optGroupLabel);
									
								$('option', this).each(function() {
																
									if($(this).attr('disabled')) var option = $('<li>').html($('<span />').html($(this).text()).data('value', $(this).attr('value'))).appendTo(optGroup);
									else if($(this).parent('optgroup').attr('disabled')) var option = $('<li>').html($('<span />').html($(this).text()).data('value', $(this).attr('value'))).appendTo(optGroup);
									else var option = $('<li>').html($('<a />').html($(this).text()).data('value', $(this).attr('value')).attr('tabindex', '0')).appendTo(optGroup);
									
									if($(this).attr('id')) option.attr('id', 'option-' + $(this).attr('id'));
									if($(this).attr('class')) option.attr('class', $(this).attr('class'));
									if($(this).attr('selected')) option.addClass('selected');
									if($(this).attr('disabled')) option.addClass('disabled');
									
									if($(this).attr('title')) option.attr('title', $(this).attr('title'));
									
								});
				
							} else if($(this).get(0).tagName.toLowerCase() == 'option') {
							
								if($(this).attr('disabled')) var option = $('<li>').html($('<span />').html($(this).text()).data('value', $(this).attr('value'))).appendTo(select);
								else var option = $('<li>').html($('<a />').html($(this).text()).data('value', $(this).attr('value')).attr('tabindex', '0')).appendTo(select);
								
								if($(this).attr('id')) option.attr('id', 'option-' + $(this).attr('id'));
								if($(this).attr('class')) option.attr('class', $(this).attr('class'));
								if($(this).attr('selected')) option.addClass('selected');
								if($(this).attr('disabled')) option.addClass('disabled');
								if($(this).attr('title')) {
									option.attr('title', $(this).attr('title'));
									$('<span />').addClass('description').html($(this).attr('title')).appendTo(option);
								}
								
							}				 
						})
						
						select.css({
							'position': 'absolute',
							'left': $(this).offset().left,
							'top': $(this).offset().top + $(this).outerHeight(),
							'min-width': $(this).outerWidth(),
							'max-height': $(window).height()/3
						});
						
						/*select.css('left', '-=' + select.find('a:eq(0)').css('padding-left')); */
						
						// open select
						openAltSelect();
						
						$('a', select).click(function() {
													  
							// if multiple
							if(obj.attr('multiple')) {
								
								// if is selected
								if($('option[value = ' + $(this).data('value') + ']', obj).attr('selected')) {
									
									$(this).closest('li').removeClass('selected');
									$('option[value = ' + $(this).data('value') + ']', obj).attr('selected', false);
									
								} else {
									
									$(this).closest('li').addClass('selected');
									$('option[value = ' + $(this).data('value') + ']', obj).attr('selected', true);
								}
								
								var name = $('option:selected:first', obj).text();
								var length = $('option:selected', obj).length;
								var selected = '';
								var i = 0;
								
								$('option:selected', obj).each(function() {
									if(i == 0) selected += $(this).text();	
									else selected += options.multipleTitleSeparator + $(this).text();
									i++;
								});
					
								if(length == 1) title = options.multipleTitleOne;
								else if(length == 0) title = options.multipleTitleNone;
								else title = options.multipleTitle;
								
								title = title.replace("%t", name).replace("%n", length).replace("%l", length - 1).replace("%a", selected);
								
								selectLabel.html(title);
								obj.trigger('change');
								
							} else {
								
								obj.val($(this).data('value'));

								selectLabel.html($(this).text());
								
								select[options.select]();
								letters[options.close]().remove();
								selectLabel.focus();
								obj.trigger('change');
								
							}
						});
						
						var i = 0;
						var letter = '';
						
						/* container for letters. design it with CSS: .altselectletters */
						var letters = $('<div />')
							.attr('id', 'altselectsearch')
								.css({
									'z-index': '1000',
									'display': 'none',
									'position': 'absolute',
									'top': select.offset().top,
									'left': select.offset().left + select.outerWidth() + 10,
									'background-color': select.css('background-color')
								})
								.append($('<span />')
									.addClass('letters')
									.text(letter))
								
								.append($('<a />')
									.addClass('close')
									.html('&times;')
									.bind('click', function() {
										var e = $.Event("keydown");
										e.which = 46;
										select.trigger(e);
									})
								)
								.appendTo('body');
						
						select
							.keydown(function(e) {
							
							if (e == null) keycode = e.keyCode;
							else keycode = e.which;
							
							if((keycode >= 48 && keycode <= 90) || (keycode >= 96 && keycode <= 105) || keycode == 8 || keycode == 32 || keycode == 46) {
								
								// convert numpad codes
								if(keycode >= 96 && keycode <= 105) keycode = keycode - 48;
								
								// spacebar 
								if(keycode == 32) e.preventDefault();
								
								// make contains case insensitive
								$.expr[':'].contains = function(e, i, m) { 
									return $(e).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0; 
								};
		
								if(String.fromCharCode(keycode) != letter) i = 0;
								
								if(keycode == 8) { //if backspace is sent
									e.preventDefault();
									var newLetter = letter.slice(0, -1);
									letter = newLetter;
								} else if(keycode == 46) { // if delete is sent
									e.preventDefault();
									letter = '';
									letters[options.close]();
								} else letter += String.fromCharCode(keycode);
								
								/* show letters if there is even one letter */
								if(letter.length > 0) {
									if(letters.is(':hidden')) letters[options.open]();
								} else letters[options.hide]();
								
								$('.letters', letters).html(letter.toLowerCase());
		
								// hide options that do not match
								
								// hide disabled options/optgroups
								$('li.disabled', this).hide();
								// hide options
								$('a', this).not(':contains("' + letter.toLowerCase() + '")').parent('li').hide();
								
								// show only matched options label
								$('.label', this).each(function() {
									if($('li a:contains("' + letter.toLowerCase() + '")', $(this).next('ul')).size() == 0) $(this).hide();
								});		
		
								var matches = $('a:contains("' + letter.toLowerCase() + '")', this);
								
								if($('.nomatch', letters).length != 0) $('.nomatch', letters).hide().remove();
								
								// if there are no matches, show everything again
								if(matches.length == 0 || letter.length == 0) {
									$('li', this).show();
									$('.label', this).show();
									$('a', this).eq(0).focus();
								} else {
									matches.parent('li').show();
									matches.eq(0).focus();
								}
								
								if(matches.length == 0) $('<span />').addClass('nomatch').html(options.nomatch).insertBefore('.close', letters).show();
								i++;
							}
							
							var index = $('a:visible', this).index($('a:focus', this));
							var length = $('a:visible', this).length;	
							
							switch(keycode) {
								case 13: //enter
									$('a:focus', this).trigger('click');
								break;
								case 27: //esc
									closeAltSelect();
									selectLabel.focus();
								break;
								case 37: // arrow left and top
								case 38:
									e.preventDefault();
									if(index == 0) index = length - 1;
									else index--;
									$('a:visible:eq('+ index +')', this).focus();
								break;
								case 39: // arrow right and down
								case 40:
									e.preventDefault();
									if(index == length - 1) index = 0;
									else index++;
									$('a:visible:eq('+ index +')', this).focus();
								break;
							}
						});
						
					} else {
						/* No it was not obj that triggered click. First thing, notify obj */
						obj.triggerHandler('click');
					}
					
					function openAltSelect() {
						select.appendTo('body')[options.open]('','',function() {
							$(document).bind('click.altSelect focus.altSelect', function(e) {
								if($(e.target).closest(select).length == 0 && $(e.target).closest(letters).length == 0) closeAltSelect();
							});
						});
						
						// if select needs scrollbar, make some room for it 
						if(select.outerHeight() < select[0].scrollHeight) select.css('width', '+=15');
						$('li.selected:first a', select).focus();
					}
					
					function closeAltSelect() {
						letters[options.close]().remove();
						select[options.close]().remove();
						selectLabel.removeClass('active');
						$(document).unbind('.altSelect');
					}
					
				});
				
				/* INTERACTION: FOCUS on a.altselect */
				selectLabel.bind('focus', function(e, param) {
					
					if(param != 'focused') {
						/* pre. notice real element */
						obj.triggerHandler('focus');
					}
				});
				
				/* INTERACTION: CHANGE on a.altselect */
				selectLabel.bind('change', function(e, param) {
					
					e.preventDefault();
					obj.altselect('update');
					/* it never calls obj.change, because only real select can be changed */
				});
				
				/* INTERACTION: BLUR on a.altselect */
				selectLabel.bind('blur', function(e, param) {
					e.preventDefault();
					
					if(param != 'blurred') {
						/* pre. notice real element */
						obj.triggerHandler('blur');
					}
				});
				
				
				/* obj events  */
				obj.bind('focus', function(e) {
					/* 1. does onfocus etc. and notices altselect, stating it has already ran */
					selectLabel.trigger('focus', 'focused');
				});
				obj.bind('click', function(e) {
					/* does onclick etc. and notices altselect */
					selectLabel.trigger('click', 'clicked');
				});
				obj.bind('change', function() {
					/* 1. does onfocus etc. and notices altselect, stating it has already ran */
					selectLabel.trigger('change', 'changed');

				});
				obj.bind('blur', function(e) {
					/* 1. does onblur etc. and notices altselect, stating it has already ran */
					selectLabel.trigger('blur', 'blurred');
				});

				obj.addClass('hasAltSelect');
			});
			
		},
		
		remove : function( ) { 
			return this.each(function() {  
				
				if($(this).hasClass('hasAltSelect')) {
					
					var obj = $(this);
					
					if(obj.prev('a.altselect').length) {
						obj.prev('a.altselect').remove();
						obj.removeClass('hasAltSelect');
					}
				}
			});
		},
		
		update : function() { 
		
			var options = $.extend(defaults, options);
			return this.each(function() {  
				
				var obj = $(this);
				
				if(obj.hasClass('hasAltSelect')) {
					
					if(obj.attr('multiple')) {
						
						var name = $('option:selected:first', obj).text();
						var length = $('option:selected', obj).length;
						var selected = '';
						var i = 0;
							
						$('option:selected', obj).each(function() {
							if(i == 0) selected += $(this).text();	
							else selected += options.multipleTitleSeparator + $(this).text();
							i++;
						});
				
						if(length == 1) title = options.multipleTitleOne;
						else if(length == 0) title = options.multipleTitleNone;
						else title = options.multipleTitle;
							
						title = $('<span />').html(title.replace("%t", name).replace("%n", length).replace("%l", length - 1).replace("%a", selected));
						obj.prev('a.altselect').html(title);

					} else {
						obj.prev('a.altselect').html($('<span />').text($('option:selected', obj).text()));
					}
				} else {
					obj.altselect();
				}
			});
		}
	};
  
	$.fn.altselect = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.altSelect' );
		}  
	};  
})(jQuery); 
