(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var account = {
        
        buttonUpdateAccountDetails: document.getElementById('accountDetailsSubmit'),
        buttonUpdateLoginDetails: document.getElementById('accountLoginSubmit'),
        
        init: function() {
            
            $(this.buttonUpdateAccountDetails).on('click', this.updateAccountDetails);
            $(this.buttonUpdateLoginDetails).on('click', this.updateLoginDetails);
                        
        },
        
        
        /*
            updates account details
        */
        updateAccountDetails: function() {
            
            //all fields filled in?
            
            var allGood = 1;
            
            if( $('#account_details input#firstname').val() === '' ) {
                $('#account_details input#firstname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#firstname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_details input#lastname').val() === '' ) {
                $('#account_details input#lastname').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_details input#lastname').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
		
            if( allGood === 1 ) {

                var theButton = $(this);
                
                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_details .loader').fadeIn(500);
                
                //remove alerts
                $('#account_details .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/uaccount",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_details').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_details .loader').hide();
                    $('#account_details .alerts').append( $(ret.responseHTML) );

                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_details .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                });

            }
            
        },
        
        
        /*
            updates account login details
        */
        updateLoginDetails: function() {
			
			console.log(appUI);
            
            var allGood = 1;
            
            if( $('#account_login input#email').val() === '' ) {
                $('#account_login input#email').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#email').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( $('#account_login input#password').val() === '' ) {
                $('#account_login input#password').closest('.form-group').addClass('has-error');
                allGood = 0;
            } else {
                $('#account_login input#password').closest('.form-group').removeClass('has-error');
                allGood = 1;
            }
            
            if( allGood === 1 ) {
                
                var theButton = $(this);

                //disable button
                $(this).addClass('disabled');
                
                //show loader
                $('#account_login .loader').fadeIn(500);
                
                //remove alerts
                $('#account_login .alerts > *').remove();
                
                $.ajax({
                    url: appUI.siteUrl+"users/ulogin",
                    type: 'post',
                    dataType: 'json',
                    data: $('#account_login').serialize()
                }).done(function(ret){
                    
                    //enable button
                    theButton.removeClass('disabled');
                    
                    //hide loader
                    $('#account_login .loader').hide();
                    $('#account_login .alerts').append( $(ret.responseHTML) );
					
                    if( ret.responseCode === 1 ) {//success
                        setTimeout(function () { 
                            $('#account_login .alerts > *').fadeOut(500, function () { $(this).remove(); });
                        }, 3000);
                    }
                
                });
            
            }
            
        }
        
    };
    
    account.init();

}());
},{"./ui.js":4}],2:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var sites = {
        
        wrapperSites: document.getElementById('sites'),
        selectUser: document.getElementById('userDropDown'),
        selectSort: document.getElementById('sortDropDown'),
        buttonDeleteSite: document.getElementById('deleteSiteButton'),
		buttonsDeleteSite: document.querySelectorAll('.deleteSiteButton'),
        
        init: function() {
            
            this.createThumbnails();
            
            $(this.selectUser).on('change', this.filterUser);
            $(this.selectSort).on('change', this.changeSorting);
            $(this.buttonsDeleteSite).on('click', this.deleteSite);
			$(this.buttonDeleteSite).on('click', this.deleteSite);
            
        },
        
        
        /*
            applies zoomer to create the iframe thubmnails
        */
        createThumbnails: function() {
                        
            $(this.wrapperSites).find('iframe').each(function(){
                            
                var theHeight = $(this).attr('data-height')*0.25;
                
                $(this).zoomer({
                    zoom: 0.25,
                    height: theHeight,
                    width: $(this).parent().width(),
                    message: "",
                    messageURL: appUI.siteUrl+"sites/"+$(this).attr('data-siteid')
                });
                
                $(this).closest('.site').find('.zoomer-cover > a').attr('target', '');
                    
            });
            
        },
        
        
        /*
            filters the site list by selected user
        */
        filterUser: function() {
            
            if( $(this).val() === 'All' || $(this).val() === '' ) {
                $('#sites .site').hide().fadeIn(500);
            } else {
                $('#sites .site').hide();
                $('#sites').find('[data-name="'+$(this).val()+'"]').fadeIn(500);
            }
            
        },
        
        
        /*
            chnages the sorting on the site list
        */
        changeSorting: function() {

            var sites;
            
            if( $(this).val() === 'NoOfPages' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
                    
                    var an = a.getAttribute('data-pages');
					var bn = b.getAttribute('data-pages');
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
					return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			} else if( $(this).val() === 'CreationDate' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
			
					var an = a.getAttribute('data-created').replace("-", "");
					var bn = b.getAttribute('data-created').replace("-", "");
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
					return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			} else if( $(this).val() === 'LastUpdate' ) {
		
				sites = $('#sites .site');
			
				sites.sort( function(a,b){
			
					var an = a.getAttribute('data-update').replace("-", "");
					var bn = b.getAttribute('data-update').replace("-", "");
				
					if(an > bn) {
						return 1;
					}
				
					if(an < bn) {
						return -1;
					}
				
				return 0;
				
				} );
			
				sites.detach().appendTo( $('#sites') );
		
			}
            
        },
        
        
        /*
            deletes a site
        */
        deleteSite: function(e) {
			            
            e.preventDefault();
            
            $('#deleteSiteModal .modal-content p').show();
            
            //remove old alerts
            $('#deleteSiteModal .modal-alerts > *').remove();
            $('#deleteSiteModal .loader').hide();
		
            var toDel = $(this).closest('.site');
            var delButton = $(this);
           
            $('#deleteSiteModal button#deleteSiteButton').show();
            $('#deleteSiteModal').modal('show');
           
            $('#deleteSiteModal button#deleteSiteButton').unbind('click').click(function(){
                
                $(this).addClass('disabled');
                $('#deleteSiteModal .loader').fadeIn(500);
               
                $.ajax({
                    url: appUI.siteUrl+"sites/trash/"+delButton.attr('data-siteid'),
                    type: 'post',
                    dataType: 'json'
                }).done(function(ret){
                    
                    $('#deleteSiteModal .loader').hide();
                    $('#deleteSiteModal button#deleteSiteButton').removeClass('disabled');
                   
                    if( ret.responseCode === 0 ) {//error
                       
                        $('#deleteSiteModal .modal-content p').hide();
                        $('#deleteSiteModal .modal-alerts').append( $(ret.responseHTML) );
                   
                    } else if( ret.responseCode === 1 ) {//all good
                       
                        $('#deleteSiteModal .modal-content p').hide();
                        $('#deleteSiteModal .modal-alerts').append( $(ret.responseHTML) );
                        $('#deleteSiteModal button#deleteSiteButton').hide();
                       
                        toDel.fadeOut(800, function(){
                            $(this).remove();
                        });
                    }
               
                });	
            });
            
        }
        
    };
    
    sites.init();

}());
},{"./ui.js":4}],3:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;

	var siteSettings = {
        
        //buttonSiteSettings: document.getElementById('siteSettingsButton'),
		buttonSiteSettings2: $('.siteSettingsModalButton'),
        buttonSaveSiteSettings: document.getElementById('saveSiteSettingsButton'),
    
        init: function() {
            
            //$(this.buttonSiteSettings).on('click', this.siteSettingsModal);
			this.buttonSiteSettings2.on('click', this.siteSettingsModal);
            $(this.buttonSaveSiteSettings).on('click', this.saveSiteSettings);
        
        },
    
        /*
            loads the site settings data
        */
        siteSettingsModal: function(e) {
            
            e.preventDefault();
    		
    		$('#siteSettings').modal('show');
    		
    		//destroy all alerts
    		$('#siteSettings .alert').fadeOut(500, function(){
    		
    			$(this).remove();
    		
    		});
    		
    		//set the siteID
    		$('input#siteID').val( $(this).attr('data-siteid') );
    		
    		//destroy current forms
    		$('#siteSettings .modal-body-content > *').each(function(){
    			$(this).remove();
    		});
    		
            //show loader, hide rest
    		$('#siteSettingsWrapper .loader').show();
    		$('#siteSettingsWrapper > *:not(.loader)').hide();
    		
    		//load site data using ajax
    		$.ajax({
                url: appUI.siteUrl+"sites/siteAjax/"+$(this).attr('data-siteid'),
    			type: 'post',
    			dataType: 'json'
    		}).done(function(ret){    			
    			
    			if( ret.responseCode === 0 ) {//error
    			
    				//hide loader, show error message
    				$('#siteSettings .loader').fadeOut(500, function(){
    					
    					$('#siteSettings .modal-alerts').append( $(ret.responseHTML) );
    				
    				});
    				
    				//disable submit button
    				$('#saveSiteSettingsButton').addClass('disabled');
    			
    			
    			} else if( ret.responseCode === 1 ) {//all well :)
    			
    				//hide loader, show data
    				
    				$('#siteSettings .loader').fadeOut(500, function(){
    				
    					$('#siteSettings .modal-body-content').append( $(ret.responseHTML) );
                        
                        $('body').trigger('siteSettingsLoad');
    				
    				});
    				
    				//enable submit button
    				$('#saveSiteSettingsButton').removeClass('disabled');
                        			
    			}
    		
    		});
            
        },
        
        
        /*
            saves the site settings
        */
        saveSiteSettings: function() {
            
            //destroy all alerts
    		$('#siteSettings .alert').fadeOut(500, function(){
    		
    			$(this).remove();
    		
    		});
    		
    		//disable button
    		$('#saveSiteSettingsButton').addClass('disabled');
    		
    		//hide form data
    		$('#siteSettings .modal-body-content > *').hide();
    		
    		//show loader
    		$('#siteSettings .loader').show();
    		
    		$.ajax({
                url: appUI.siteUrl+"sites/siteAjaxUpdate",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		
    			if( ret.responseCode === 0 ) {//error
    			
    				$('#siteSettings .loader').fadeOut(500, function(){
    				
    					$('#siteSettings .modal-alerts').append( ret.responseHTML );
    					
    					//show form data
    					$('#siteSettings .modal-body-content > *').show();
    					
    					//enable button
    					$('#saveSiteSettingsButton').removeClass('disabled');
    				
    				});
    			
    			
    			} else if( ret.responseCode === 1 ) {//all is well
    			
    				$('#siteSettings .loader').fadeOut(500, function(){
    					
    					
    					//update site name in top menu
    					$('#siteTitle').text( ret.siteName );
    					
    					$('#siteSettings .modal-alerts').append( ret.responseHTML );
    					
    					//hide form data
    					$('#siteSettings .modal-body-content > *').remove();
    					$('#siteSettings .modal-body-content').append( ret.responseHTML2 );
    					
    					//enable button
    					$('#saveSiteSettingsButton').removeClass('disabled');
    					
    					//is the FTP stuff all good?
    					
    					if( ret.ftpOk === 1 ) {//yes, all good
    					
    						$('#publishPage').removeAttr('data-toggle');
    						$('#publishPage span.text-danger').hide();
    						
    						$('#publishPage').tooltip('destroy');
    					
    					} else {//nope, can't use FTP
    						
    						$('#publishPage').attr('data-toggle', 'tooltip');
    						$('#publishPage span.text-danger').show();
    						
    						$('#publishPage').tooltip('show');
    					
    					}
    					
    					
    					//update the site name in the small window
    					$('#site_'+ret.siteID+' .window .top b').text( ret.siteName );
    				
    				});
    			
    			
    			}
    		
    		});
    		            
        },
        
    
    };
    
    siteSettings.init();

}());
},{"./ui.js":4}],4:[function(require,module,exports){
(function () {

/* globals siteUrl:false, baseUrl:false */
    "use strict";
        
    var appUI = {
        
        firstMenuWidth: 190,
        secondMenuWidth: 300,
        loaderAnimation: document.getElementById('loader'),
        secondMenuTriggerContainers: $('#menu #main #elementCats, #menu #main #templatesUl'),
        siteUrl: siteUrl,
        baseUrl: baseUrl,
        
        setup: function(){
            
            // Fade the loader animation
            $(appUI.loaderAnimation).fadeOut(function(){
                $('#menu').animate({'left': -appUI.firstMenuWidth}, 1000);
            });
            
            // Tabs
            $(".nav-tabs a").on('click', function (e) {
                e.preventDefault();
                $(this).tab("show");
            });
            
            $("select.select").select2();
            
            $(':radio, :checkbox').radiocheck();
            
            // Tooltips
            $("[data-toggle=tooltip]").tooltip("hide");
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all :checkbox').on('click', function () {
                var $this = $(this);
                var ch = $this.prop('checked');
                $this.closest('.table').find('tbody :checkbox').radiocheck(!ch ? 'uncheck' : 'check');
            });
            
            // Add style class name to a tooltips
            $(".tooltip").addClass(function() {
                if ($(this).prev().attr("data-tooltip-style")) {
                    return "tooltip-" + $(this).prev().attr("data-tooltip-style");
                }
            });
            
            $(".btn-group").on('click', "a", function() {
                $(this).siblings().removeClass("active").end().addClass("active");
            });
            
            // Focus state for append/prepend inputs
            $('.input-group').on('focus', '.form-control', function () {
                $(this).closest('.input-group, .form-group').addClass('focus');
            }).on('blur', '.form-control', function () {
                $(this).closest('.input-group, .form-group').removeClass('focus');
            });
            
            // Table: Toggle all checkboxes
            $('.table .toggle-all').on('click', function() {
                var ch = $(this).find(':checkbox').prop('checked');
                $(this).closest('.table').find('tbody :checkbox').checkbox(!ch ? 'check' : 'uncheck');
            });
            
            // Table: Add class row selected
            $('.table tbody :checkbox').on('check uncheck toggle', function (e) {
                var $this = $(this)
                , check = $this.prop('checked')
                , toggle = e.type === 'toggle'
                , checkboxes = $('.table tbody :checkbox')
                , checkAll = checkboxes.length === checkboxes.filter(':checked').length;

                $this.closest('tr')[check ? 'addClass' : 'removeClass']('selected-row');
                if (toggle) $this.closest('.table').find('.toggle-all :checkbox').checkbox(checkAll ? 'check' : 'uncheck');
            });
            
            // Switch
            $("[data-toggle='switch']").wrap('<div class="switch" />').parent().bootstrapSwitch();
                        
            appUI.secondMenuTriggerContainers.on('click', 'a:not(.btn)', appUI.secondMenuAnimation);
                        
        },
        
        secondMenuAnimation: function(){
        
            $('#menu #main a').removeClass('active');
            $(this).addClass('active');
	
            //show only the right elements
            $('#menu #second ul li').hide();
            $('#menu #second ul li.'+$(this).attr('id')).show();

            if( $(this).attr('id') === 'all' ) {
                $('#menu #second ul#elements li').show();		
            }
	
            $('.menu .second').css('display', 'block').stop().animate({
                width: appUI.secondMenuWidth
            }, 500);	
                
        }
        
    };
    
    //initiate the UI
    appUI.setup();


    //**** EXPORTS
    module.exports.appUI = appUI;
    
}());
},{}],5:[function(require,module,exports){
(function () {
	"use strict";

	var appUI = require('./ui.js').appUI;
	
	var users = {
        
        buttonCreateAccount: document.getElementById('buttonCreateAccount'),
        wrapperUsers: document.getElementById('users'),
        
        init: function() {
            
            $(this.buttonCreateAccount).on('click', this.createAccount);
            $(this.wrapperUsers).on('click', '.updateUserButton', this.updateUser);
            $(this.wrapperUsers).on('click', '.passwordReset', this.passwordReset);
            $(this.wrapperUsers).on('click', '.deleteUserButton', this.deleteUser);
            
        },
        
        
        /*
            creates a new user account
        */
        createAccount: function() {
            
            //all items present?
            
            var allGood = 1;
            
            if( $('#newUserModal form input#firstname').val() === '' ) {
                $('#newUserModal form input#firstname').parent().addClass('has-error');
                allGood = 0;
            } else {
                $('#newUserModal form input#firstname').parent().removeClass('has-error');			
            }
            
            if( $('#newUserModal form input#lastname').val() === '' ) {
                $('#newUserModal form input#lastname').parent().addClass('has-error');
                allGood = 0;
            } else {
                $('#newUserModal form input#lastname').parent().removeClass('has-error');
            }
            
            if( $('#newUserModal form input#email').val() === '' ) {
                $('#newUserModal form input#email').parent().addClass('has-error');
                allGood = 0;
            } else {
                $('#newUserModal form input#email').parent().removeClass('has-error');
            }
            
            if( $('#newUserModal form input#password').val() === '' ) {
                $('#newUserModal form input#password').parent().addClass('has-error');
                allGood = 0;
            } else {
                $('#newUserModal form input#password').parent().removeClass('has-error');
            }
		
            if( allGood === 1 ) {
                
                //remove old alerts
                $('#newUserModal .modal-alerts > *').hide();

                //disable button
                $(this).addClass('disabled');

                //show loader
                $('#newUserModal .loader').fadeIn();
                
                $.ajax({
                    url: $('#newUserModal form').attr('action'),
                    type: 'post',
                    dataType: 'json',
                    data:  $('#newUserModal form').serialize()
                }).done(function(ret){
			
                    //enable button
                    $('button#buttonCreateAccount').removeClass('disabled');

                    //hide loader
                    $('#newUserModal .loader').hide();
			
                    if( ret.responseCode === 0 ) {//error
                        
                        $('#newUserModal .modal-alerts').append( $(ret.responseHTML) );
                    
                    } else {//all good
                        
                        $('#newUserModal .modal-alerts').append( $(ret.responseHTML) );
                        $('#users > *').remove();
                        $('#users').append( $(ret.users) );
                        $('#users form input[type="checkbox"]').checkbox();
					
                        ('.userSites .site iframe').each(function(){

                            var theHeight = $(this).attr('data-height')*0.25;
                            
                            $(this).width(  );
                            
                            $(this).zoomer({
                                zoom: 0.25,
                                height: theHeight,
                                width: $(this).closest('.tab-pane').width(),
                                message: "",
                                messageURL: appUI.siteUrl+"sites/"+$(this).attr('data-siteid')
                            });
                            
                            $(this).closest('.site').find('.zoomer-cover > a').attr('target', '');
                        
                        });
                    
                    }
                
                });
            
            }
            
        },
        
        
        /*
            updates a user
        */
        updateUser: function() {
                    
            //disable button
            var theButton = $(this);		
            $(this).addClass('disabled');
	
            //show loader
            $(this).closest('.bottom').find('.loader').fadeIn(500);
            
            $.ajax({
                url: $(this).closest('form').attr('action'),
                type: 'post',
                dataType: 'json',
                data: $(this).closest('form').serialize()
            }).done(function(ret){
		
                //enable button
                theButton.removeClass('disabled');
			
                //hide loader
                theButton.closest('.bottom').find('.loader').hide();
                
                if( ret.responseCode === 0 ) {//error
                    
                    theButton.closest('.bottom').find('.alerts').append( $(ret.responseHTML) );
                    
                } else if(ret.responseCode === 1) {//all good
                    
                    theButton.closest('.bottom').find('.alerts').append( $(ret.responseHTML) );				
                    
                    //append user detail form
                    var thePane = theButton.closest('.tab-pane');
				
                    setTimeout(function(){
                        thePane.closest('.bottom').find('.alert-success').fadeOut(500, function(){$(this.remove());});
                    }, 3000);
                    
                    theButton.closest('form').remove();
                    
                    thePane.prepend( $(ret.userDetailForm) );
                    thePane.find('form input[type="checkbox"]').checkbox();
                
                }
            
            });
            
        },
        
        
        /*
            password reset
        */
        passwordReset: function(e) {
            
            e.preventDefault();
            
            var theButton = $(this);
            
            //disable buttons
            $(this).addClass('disabled');
            $(this).closest('.bottom').find('.updateUserButton').addClass('disabled');
            
            //show loader
            $(this).closest('.bottom').find('.loader').fadeIn();
		
            $.ajax({
                url: appUI.siteUrl+"users/rpw/"+$(this).attr('data-userid'),
                type: 'post',
                dataType: 'json'
            }).done(function(ret){
                
                //enable buttons
                theButton.removeClass('disabled');
                theButton.closest('.bottom').find('.updateUserButton').removeClass('disabled');

                //hide loader
                theButton.closest('.bottom').find('.loader').hide();
                $(theButton).closest('.bottom').find('.alerts').append( $(ret.responseHTML) );
                
                if( ret.responseCode === 0 ) {//error
			
				} else if( ret.responseCode === 1 ) {//all good
                    
                    setTimeout(function(){ 
                        theButton.closest('.bottom').find('.alerts > *').fadeOut(500, function(){$(this).remove();});
                    }, 3000);
                
                }
            
            });
            
        },
        
        
        /*
            deletes a user account
        */
        deleteUser: function(e) {
            
            e.preventDefault();
            
            //setup delete link
            $('#deleteUserModal a#deleteUserButton').attr('href', $(this).attr('href'));
            
            //modal
            $('#deleteUserModal').modal('show');
            
        }
        
    };
    
    users.init();
	
}());
},{"./ui.js":4}],6:[function(require,module,exports){
(function () {
	"use strict";

	require('./modules/ui');
	require('./modules/users');
	require('./modules/account');
	require('./modules/sitesettings');
	require('./modules/sites');

	$('.userSites .site iframe').each(function(){
    	    	
        var theHeight = $(this).attr('data-height')*0.25;
    		
        //alert($(this).closest('.tab-content').innerWidth())
    		    	    	
        $(this).zoomer({
            zoom: 0.20,
            height: theHeight,
            width: $(this).closest('.tab-content').width(),
            message: "",
            messageURL: "<?php echo site_url('sites')?>/"+$(this).attr('data-siteid')
        });
    		
        $(this).closest('.site').find('.zoomer-cover > a').attr('target', '');
    	
    })

}());
},{"./modules/account":1,"./modules/sites":2,"./modules/sitesettings":3,"./modules/ui":4,"./modules/users":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tb2R1bGVzL2FjY291bnQuanMiLCJqcy9tb2R1bGVzL3NpdGVzLmpzIiwianMvbW9kdWxlcy9zaXRlc2V0dGluZ3MuanMiLCJqcy9tb2R1bGVzL3VpLmpzIiwianMvbW9kdWxlcy91c2Vycy5qcyIsImpzL3VzZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cblx0dmFyIGFjY291bnQgPSB7XG4gICAgICAgIFxuICAgICAgICBidXR0b25VcGRhdGVBY2NvdW50RGV0YWlsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY291bnREZXRhaWxzU3VibWl0JyksXG4gICAgICAgIGJ1dHRvblVwZGF0ZUxvZ2luRGV0YWlsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY291bnRMb2dpblN1Ym1pdCcpLFxuICAgICAgICBcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25VcGRhdGVBY2NvdW50RGV0YWlscykub24oJ2NsaWNrJywgdGhpcy51cGRhdGVBY2NvdW50RGV0YWlscyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uVXBkYXRlTG9naW5EZXRhaWxzKS5vbignY2xpY2snLCB0aGlzLnVwZGF0ZUxvZ2luRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlcyBhY2NvdW50IGRldGFpbHNcbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlQWNjb3VudERldGFpbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FsbCBmaWVsZHMgZmlsbGVkIGluP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNsYXN0bmFtZScpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2xhc3RuYW1lJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgaW5wdXQjbGFzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cblx0XHRcbiAgICAgICAgICAgIGlmKCBhbGxHb29kID09PSAxICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRoZUJ1dHRvbiA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmxvYWRlcicpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIGFsZXJ0c1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cyA+IConKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJ1c2Vycy91YWNjb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICQoJyNhY2NvdW50X2RldGFpbHMnKS5zZXJpYWxpemUoKVxuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0aGVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyAuYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9zdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyAuYWxlcnRzID4gKicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbiAoKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZXMgYWNjb3VudCBsb2dpbiBkZXRhaWxzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZUxvZ2luRGV0YWlsczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nKGFwcFVJKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBhbGxHb29kID09PSAxICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVCdXR0b24gPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIC5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBhbGVydHNcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzID4gKicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInVzZXJzL3Vsb2dpblwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICQoJyNhY2NvdW50X2xvZ2luJykuc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdGhlQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAubG9hZGVyJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIC5hbGVydHMgPiAqJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uICgpIHsgJCh0aGlzKS5yZW1vdmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIGFjY291bnQuaW5pdCgpO1xuXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBhcHBVSSA9IHJlcXVpcmUoJy4vdWkuanMnKS5hcHBVSTtcblxuXHR2YXIgc2l0ZXMgPSB7XG4gICAgICAgIFxuICAgICAgICB3cmFwcGVyU2l0ZXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaXRlcycpLFxuICAgICAgICBzZWxlY3RVc2VyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlckRyb3BEb3duJyksXG4gICAgICAgIHNlbGVjdFNvcnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3J0RHJvcERvd24nKSxcbiAgICAgICAgYnV0dG9uRGVsZXRlU2l0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZVNpdGVCdXR0b24nKSxcblx0XHRidXR0b25zRGVsZXRlU2l0ZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlbGV0ZVNpdGVCdXR0b24nKSxcbiAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVRodW1ibmFpbHMoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLnNlbGVjdFVzZXIpLm9uKCdjaGFuZ2UnLCB0aGlzLmZpbHRlclVzZXIpO1xuICAgICAgICAgICAgJCh0aGlzLnNlbGVjdFNvcnQpLm9uKCdjaGFuZ2UnLCB0aGlzLmNoYW5nZVNvcnRpbmcpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbnNEZWxldGVTaXRlKS5vbignY2xpY2snLCB0aGlzLmRlbGV0ZVNpdGUpO1xuXHRcdFx0JCh0aGlzLmJ1dHRvbkRlbGV0ZVNpdGUpLm9uKCdjbGljaycsIHRoaXMuZGVsZXRlU2l0ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgYXBwbGllcyB6b29tZXIgdG8gY3JlYXRlIHRoZSBpZnJhbWUgdGh1Ym1uYWlsc1xuICAgICAgICAqL1xuICAgICAgICBjcmVhdGVUaHVtYm5haWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLndyYXBwZXJTaXRlcykuZmluZCgnaWZyYW1lJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVIZWlnaHQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtaGVpZ2h0JykqMC4yNTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnpvb21lcih7XG4gICAgICAgICAgICAgICAgICAgIHpvb206IDAuMjUsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhlSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogJCh0aGlzKS5wYXJlbnQoKS53aWR0aCgpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVVJMOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvXCIrJCh0aGlzKS5hdHRyKCdkYXRhLXNpdGVpZCcpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuc2l0ZScpLmZpbmQoJy56b29tZXItY292ZXIgPiBhJykuYXR0cigndGFyZ2V0JywgJycpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGZpbHRlcnMgdGhlIHNpdGUgbGlzdCBieSBzZWxlY3RlZCB1c2VyXG4gICAgICAgICovXG4gICAgICAgIGZpbHRlclVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCh0aGlzKS52YWwoKSA9PT0gJ0FsbCcgfHwgJCh0aGlzKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI3NpdGVzIC5zaXRlJykuaGlkZSgpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjc2l0ZXMgLnNpdGUnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgJCgnI3NpdGVzJykuZmluZCgnW2RhdGEtbmFtZT1cIicrJCh0aGlzKS52YWwoKSsnXCJdJykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2huYWdlcyB0aGUgc29ydGluZyBvbiB0aGUgc2l0ZSBsaXN0XG4gICAgICAgICovXG4gICAgICAgIGNoYW5nZVNvcnRpbmc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgc2l0ZXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKHRoaXMpLnZhbCgpID09PSAnTm9PZlBhZ2VzJyApIHtcblx0XHRcblx0XHRcdFx0c2l0ZXMgPSAkKCcjc2l0ZXMgLnNpdGUnKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5zb3J0KCBmdW5jdGlvbihhLGIpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFuID0gYS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFnZXMnKTtcblx0XHRcdFx0XHR2YXIgYm4gPSBiLmdldEF0dHJpYnV0ZSgnZGF0YS1wYWdlcycpO1xuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA+IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuIDwgYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0XHRcblx0XHRcdFx0fSApO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLmRldGFjaCgpLmFwcGVuZFRvKCAkKCcjc2l0ZXMnKSApO1xuXHRcdFxuXHRcdFx0fSBlbHNlIGlmKCAkKHRoaXMpLnZhbCgpID09PSAnQ3JlYXRpb25EYXRlJyApIHtcblx0XHRcblx0XHRcdFx0c2l0ZXMgPSAkKCcjc2l0ZXMgLnNpdGUnKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5zb3J0KCBmdW5jdGlvbihhLGIpe1xuXHRcdFx0XG5cdFx0XHRcdFx0dmFyIGFuID0gYS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY3JlYXRlZCcpLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuXHRcdFx0XHRcdHZhciBibiA9IGIuZ2V0QXR0cmlidXRlKCdkYXRhLWNyZWF0ZWQnKS5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPiBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA8IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0XG5cdFx0XHRcdH0gKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5kZXRhY2goKS5hcHBlbmRUbyggJCgnI3NpdGVzJykgKTtcblx0XHRcblx0XHRcdH0gZWxzZSBpZiggJCh0aGlzKS52YWwoKSA9PT0gJ0xhc3RVcGRhdGUnICkge1xuXHRcdFxuXHRcdFx0XHRzaXRlcyA9ICQoJyNzaXRlcyAuc2l0ZScpO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLnNvcnQoIGZ1bmN0aW9uKGEsYil7XG5cdFx0XHRcblx0XHRcdFx0XHR2YXIgYW4gPSBhLmdldEF0dHJpYnV0ZSgnZGF0YS11cGRhdGUnKS5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcblx0XHRcdFx0XHR2YXIgYm4gPSBiLmdldEF0dHJpYnV0ZSgnZGF0YS11cGRhdGUnKS5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPiBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA8IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdFxuXHRcdFx0XHR9ICk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuZGV0YWNoKCkuYXBwZW5kVG8oICQoJyNzaXRlcycpICk7XG5cdFx0XG5cdFx0XHR9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZGVsZXRlcyBhIHNpdGVcbiAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlU2l0ZTogZnVuY3Rpb24oZSkge1xuXHRcdFx0ICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWNvbnRlbnQgcCcpLnNob3coKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZW1vdmUgb2xkIGFsZXJ0c1xuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtYWxlcnRzID4gKicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubG9hZGVyJykuaGlkZSgpO1xuXHRcdFxuICAgICAgICAgICAgdmFyIHRvRGVsID0gJCh0aGlzKS5jbG9zZXN0KCcuc2l0ZScpO1xuICAgICAgICAgICAgdmFyIGRlbEJ1dHRvbiA9ICQodGhpcyk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCBidXR0b24jZGVsZXRlU2l0ZUJ1dHRvbicpLnNob3coKTtcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgYnV0dG9uI2RlbGV0ZVNpdGVCdXR0b24nKS51bmJpbmQoJ2NsaWNrJykuY2xpY2soZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLmxvYWRlcicpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvdHJhc2gvXCIrZGVsQnV0dG9uLmF0dHIoJ2RhdGEtc2l0ZWlkJyksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCBidXR0b24jZGVsZXRlU2l0ZUJ1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtY29udGVudCBwJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL2FsbCBnb29kXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtY29udGVudCBwJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIGJ1dHRvbiNkZWxldGVTaXRlQnV0dG9uJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvRGVsLmZhZGVPdXQoODAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICBzaXRlcy5pbml0KCk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGFwcFVJID0gcmVxdWlyZSgnLi91aS5qcycpLmFwcFVJO1xuXG5cdHZhciBzaXRlU2V0dGluZ3MgPSB7XG4gICAgICAgIFxuICAgICAgICAvL2J1dHRvblNpdGVTZXR0aW5nczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NpdGVTZXR0aW5nc0J1dHRvbicpLFxuXHRcdGJ1dHRvblNpdGVTZXR0aW5nczI6ICQoJy5zaXRlU2V0dGluZ3NNb2RhbEJ1dHRvbicpLFxuICAgICAgICBidXR0b25TYXZlU2l0ZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLFxuICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8kKHRoaXMuYnV0dG9uU2l0ZVNldHRpbmdzKS5vbignY2xpY2snLCB0aGlzLnNpdGVTZXR0aW5nc01vZGFsKTtcblx0XHRcdHRoaXMuYnV0dG9uU2l0ZVNldHRpbmdzMi5vbignY2xpY2snLCB0aGlzLnNpdGVTZXR0aW5nc01vZGFsKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25TYXZlU2l0ZVNldHRpbmdzKS5vbignY2xpY2snLCB0aGlzLnNhdmVTaXRlU2V0dGluZ3MpO1xuICAgICAgICBcbiAgICAgICAgfSxcbiAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGxvYWRzIHRoZSBzaXRlIHNldHRpbmdzIGRhdGFcbiAgICAgICAgKi9cbiAgICAgICAgc2l0ZVNldHRpbmdzTW9kYWw6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFx0XHRcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncycpLm1vZGFsKCdzaG93Jyk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rlc3Ryb3kgYWxsIGFsZXJ0c1xuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5hbGVydCcpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcbiAgICBcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgXHRcdFxuICAgIFx0XHQvL3NldCB0aGUgc2l0ZUlEXG4gICAgXHRcdCQoJ2lucHV0I3NpdGVJRCcpLnZhbCggJCh0aGlzKS5hdHRyKCdkYXRhLXNpdGVpZCcpICk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rlc3Ryb3kgY3VycmVudCBmb3Jtc1xuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQgPiAqJykuZWFjaChmdW5jdGlvbigpe1xuICAgIFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG4gICAgXHRcdH0pO1xuICAgIFx0XHRcbiAgICAgICAgICAgIC8vc2hvdyBsb2FkZXIsIGhpZGUgcmVzdFxuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzV3JhcHBlciAubG9hZGVyJykuc2hvdygpO1xuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzV3JhcHBlciA+ICo6bm90KC5sb2FkZXIpJykuaGlkZSgpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9sb2FkIHNpdGUgZGF0YSB1c2luZyBhamF4XG4gICAgXHRcdCQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvc2l0ZUFqYXgvXCIrJCh0aGlzKS5hdHRyKCdkYXRhLXNpdGVpZCcpLFxuICAgIFx0XHRcdHR5cGU6ICdwb3N0JyxcbiAgICBcdFx0XHRkYXRhVHlwZTogJ2pzb24nXG4gICAgXHRcdH0pLmRvbmUoZnVuY3Rpb24ocmV0KXsgICAgXHRcdFx0XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0aWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDAgKSB7Ly9lcnJvclxuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0Ly9oaWRlIGxvYWRlciwgc2hvdyBlcnJvciBtZXNzYWdlXG4gICAgXHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5sb2FkZXInKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR9KTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0Ly9kaXNhYmxlIHN1Ym1pdCBidXR0b25cbiAgICBcdFx0XHRcdCQoJyNzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fSBlbHNlIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vYWxsIHdlbGwgOilcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdC8vaGlkZSBsb2FkZXIsIHNob3cgZGF0YVxuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5sb2FkZXInKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ3NpdGVTZXR0aW5nc0xvYWQnKTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0fSk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdC8vZW5hYmxlIHN1Ym1pdCBidXR0b25cbiAgICBcdFx0XHRcdCQoJyNzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcbiAgICBcdFx0XHR9XG4gICAgXHRcdFxuICAgIFx0XHR9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzYXZlcyB0aGUgc2l0ZSBzZXR0aW5nc1xuICAgICAgICAqL1xuICAgICAgICBzYXZlU2l0ZVNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZXN0cm95IGFsbCBhbGVydHNcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncyAuYWxlcnQnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XG4gICAgXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9kaXNhYmxlIGJ1dHRvblxuICAgIFx0XHQkKCcjc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9oaWRlIGZvcm0gZGF0YVxuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQgPiAqJykuaGlkZSgpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9zaG93IGxvYWRlclxuICAgIFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5sb2FkZXInKS5zaG93KCk7XG4gICAgXHRcdFxuICAgIFx0XHQkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL3NpdGVBamF4VXBkYXRlXCIsXG4gICAgXHRcdFx0dHlwZTogJ3Bvc3QnLFxuICAgIFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG4gICAgXHRcdFx0ZGF0YTogJCgnZm9ybSNzaXRlU2V0dGluZ3NGb3JtJykuc2VyaWFsaXplQXJyYXkoKVxuICAgIFx0XHR9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgXHRcdFxuICAgIFx0XHRcdGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLmxvYWRlcicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggcmV0LnJlc3BvbnNlSFRNTCApO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly9zaG93IGZvcm0gZGF0YVxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQgPiAqJykuc2hvdygpO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly9lbmFibGUgYnV0dG9uXG4gICAgXHRcdFx0XHRcdCQoJyNzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdH0pO1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFxuICAgIFx0XHRcdH0gZWxzZSBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL2FsbCBpcyB3ZWxsXG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5sb2FkZXInKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL3VwZGF0ZSBzaXRlIG5hbWUgaW4gdG9wIG1lbnVcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVUaXRsZScpLnRleHQoIHJldC5zaXRlTmFtZSApO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCByZXQucmVzcG9uc2VIVE1MICk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL2hpZGUgZm9ybSBkYXRhXG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCA+IConKS5yZW1vdmUoKTtcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50JykuYXBwZW5kKCByZXQucmVzcG9uc2VIVE1MMiApO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly9lbmFibGUgYnV0dG9uXG4gICAgXHRcdFx0XHRcdCQoJyNzYXZlU2l0ZVNldHRpbmdzQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL2lzIHRoZSBGVFAgc3R1ZmYgYWxsIGdvb2Q/XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRpZiggcmV0LmZ0cE9rID09PSAxICkgey8veWVzLCBhbGwgZ29vZFxuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2UnKS5yZW1vdmVBdHRyKCdkYXRhLXRvZ2dsZScpO1xuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZSBzcGFuLnRleHQtZGFuZ2VyJykuaGlkZSgpO1xuICAgIFx0XHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZScpLnRvb2x0aXAoJ2Rlc3Ryb3knKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7Ly9ub3BlLCBjYW4ndCB1c2UgRlRQXG4gICAgXHRcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlJykuYXR0cignZGF0YS10b2dnbGUnLCAndG9vbHRpcCcpO1xuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZSBzcGFuLnRleHQtZGFuZ2VyJykuc2hvdygpO1xuICAgIFx0XHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZScpLnRvb2x0aXAoJ3Nob3cnKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdH1cbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQvL3VwZGF0ZSB0aGUgc2l0ZSBuYW1lIGluIHRoZSBzbWFsbCB3aW5kb3dcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVfJytyZXQuc2l0ZUlEKycgLndpbmRvdyAudG9wIGInKS50ZXh0KCByZXQuc2l0ZU5hbWUgKTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0fSk7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgXHRcdCAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICBcbiAgICB9O1xuICAgIFxuICAgIHNpdGVTZXR0aW5ncy5pbml0KCk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuLyogZ2xvYmFscyBzaXRlVXJsOmZhbHNlLCBiYXNlVXJsOmZhbHNlICovXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIFxuICAgIHZhciBhcHBVSSA9IHtcbiAgICAgICAgXG4gICAgICAgIGZpcnN0TWVudVdpZHRoOiAxOTAsXG4gICAgICAgIHNlY29uZE1lbnVXaWR0aDogMzAwLFxuICAgICAgICBsb2FkZXJBbmltYXRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXInKSxcbiAgICAgICAgc2Vjb25kTWVudVRyaWdnZXJDb250YWluZXJzOiAkKCcjbWVudSAjbWFpbiAjZWxlbWVudENhdHMsICNtZW51ICNtYWluICN0ZW1wbGF0ZXNVbCcpLFxuICAgICAgICBzaXRlVXJsOiBzaXRlVXJsLFxuICAgICAgICBiYXNlVXJsOiBiYXNlVXJsLFxuICAgICAgICBcbiAgICAgICAgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZhZGUgdGhlIGxvYWRlciBhbmltYXRpb25cbiAgICAgICAgICAgICQoYXBwVUkubG9hZGVyQW5pbWF0aW9uKS5mYWRlT3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCgnI21lbnUnKS5hbmltYXRlKHsnbGVmdCc6IC1hcHBVSS5maXJzdE1lbnVXaWR0aH0sIDEwMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRhYnNcbiAgICAgICAgICAgICQoXCIubmF2LXRhYnMgYVwiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnRhYihcInNob3dcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJChcInNlbGVjdC5zZWxlY3RcIikuc2VsZWN0MigpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCc6cmFkaW8sIDpjaGVja2JveCcpLnJhZGlvY2hlY2soKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9vbHRpcHNcbiAgICAgICAgICAgICQoXCJbZGF0YS10b2dnbGU9dG9vbHRpcF1cIikudG9vbHRpcChcImhpZGVcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRhYmxlOiBUb2dnbGUgYWxsIGNoZWNrYm94ZXNcbiAgICAgICAgICAgICQoJy50YWJsZSAudG9nZ2xlLWFsbCA6Y2hlY2tib3gnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICB2YXIgY2ggPSAkdGhpcy5wcm9wKCdjaGVja2VkJyk7XG4gICAgICAgICAgICAgICAgJHRoaXMuY2xvc2VzdCgnLnRhYmxlJykuZmluZCgndGJvZHkgOmNoZWNrYm94JykucmFkaW9jaGVjayghY2ggPyAndW5jaGVjaycgOiAnY2hlY2snKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBZGQgc3R5bGUgY2xhc3MgbmFtZSB0byBhIHRvb2x0aXBzXG4gICAgICAgICAgICAkKFwiLnRvb2x0aXBcIikuYWRkQ2xhc3MoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykucHJldigpLmF0dHIoXCJkYXRhLXRvb2x0aXAtc3R5bGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidG9vbHRpcC1cIiArICQodGhpcykucHJldigpLmF0dHIoXCJkYXRhLXRvb2x0aXAtc3R5bGVcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoXCIuYnRuLWdyb3VwXCIpLm9uKCdjbGljaycsIFwiYVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikuZW5kKCkuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRm9jdXMgc3RhdGUgZm9yIGFwcGVuZC9wcmVwZW5kIGlucHV0c1xuICAgICAgICAgICAgJCgnLmlucHV0LWdyb3VwJykub24oJ2ZvY3VzJywgJy5mb3JtLWNvbnRyb2wnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuaW5wdXQtZ3JvdXAsIC5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2ZvY3VzJyk7XG4gICAgICAgICAgICB9KS5vbignYmx1cicsICcuZm9ybS1jb250cm9sJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmlucHV0LWdyb3VwLCAuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdmb2N1cycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRhYmxlOiBUb2dnbGUgYWxsIGNoZWNrYm94ZXNcbiAgICAgICAgICAgICQoJy50YWJsZSAudG9nZ2xlLWFsbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBjaCA9ICQodGhpcykuZmluZCgnOmNoZWNrYm94JykucHJvcCgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLnRhYmxlJykuZmluZCgndGJvZHkgOmNoZWNrYm94JykuY2hlY2tib3goIWNoID8gJ2NoZWNrJyA6ICd1bmNoZWNrJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVGFibGU6IEFkZCBjbGFzcyByb3cgc2VsZWN0ZWRcbiAgICAgICAgICAgICQoJy50YWJsZSB0Ym9keSA6Y2hlY2tib3gnKS5vbignY2hlY2sgdW5jaGVjayB0b2dnbGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcbiAgICAgICAgICAgICAgICAsIGNoZWNrID0gJHRoaXMucHJvcCgnY2hlY2tlZCcpXG4gICAgICAgICAgICAgICAgLCB0b2dnbGUgPSBlLnR5cGUgPT09ICd0b2dnbGUnXG4gICAgICAgICAgICAgICAgLCBjaGVja2JveGVzID0gJCgnLnRhYmxlIHRib2R5IDpjaGVja2JveCcpXG4gICAgICAgICAgICAgICAgLCBjaGVja0FsbCA9IGNoZWNrYm94ZXMubGVuZ3RoID09PSBjaGVja2JveGVzLmZpbHRlcignOmNoZWNrZWQnKS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAkdGhpcy5jbG9zZXN0KCd0cicpW2NoZWNrID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdzZWxlY3RlZC1yb3cnKTtcbiAgICAgICAgICAgICAgICBpZiAodG9nZ2xlKSAkdGhpcy5jbG9zZXN0KCcudGFibGUnKS5maW5kKCcudG9nZ2xlLWFsbCA6Y2hlY2tib3gnKS5jaGVja2JveChjaGVja0FsbCA/ICdjaGVjaycgOiAndW5jaGVjaycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFN3aXRjaFxuICAgICAgICAgICAgJChcIltkYXRhLXRvZ2dsZT0nc3dpdGNoJ11cIikud3JhcCgnPGRpdiBjbGFzcz1cInN3aXRjaFwiIC8+JykucGFyZW50KCkuYm9vdHN0cmFwU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGFwcFVJLnNlY29uZE1lbnVUcmlnZ2VyQ29udGFpbmVycy5vbignY2xpY2snLCAnYTpub3QoLmJ0biknLCBhcHBVSS5zZWNvbmRNZW51QW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgc2Vjb25kTWVudUFuaW1hdGlvbjogZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgICAgICAkKCcjbWVudSAjbWFpbiBhJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cdFxuICAgICAgICAgICAgLy9zaG93IG9ubHkgdGhlIHJpZ2h0IGVsZW1lbnRzXG4gICAgICAgICAgICAkKCcjbWVudSAjc2Vjb25kIHVsIGxpJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCB1bCBsaS4nKyQodGhpcykuYXR0cignaWQnKSkuc2hvdygpO1xuXG4gICAgICAgICAgICBpZiggJCh0aGlzKS5hdHRyKCdpZCcpID09PSAnYWxsJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjbWVudSAjc2Vjb25kIHVsI2VsZW1lbnRzIGxpJykuc2hvdygpO1x0XHRcbiAgICAgICAgICAgIH1cblx0XG4gICAgICAgICAgICAkKCcubWVudSAuc2Vjb25kJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJykuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHdpZHRoOiBhcHBVSS5zZWNvbmRNZW51V2lkdGhcbiAgICAgICAgICAgIH0sIDUwMCk7XHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIC8vaW5pdGlhdGUgdGhlIFVJXG4gICAgYXBwVUkuc2V0dXAoKTtcblxuXG4gICAgLy8qKioqIEVYUE9SVFNcbiAgICBtb2R1bGUuZXhwb3J0cy5hcHBVSSA9IGFwcFVJO1xuICAgIFxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cdFxuXHR2YXIgdXNlcnMgPSB7XG4gICAgICAgIFxuICAgICAgICBidXR0b25DcmVhdGVBY2NvdW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnV0dG9uQ3JlYXRlQWNjb3VudCcpLFxuICAgICAgICB3cmFwcGVyVXNlcnM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VycycpLFxuICAgICAgICBcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25DcmVhdGVBY2NvdW50KS5vbignY2xpY2snLCB0aGlzLmNyZWF0ZUFjY291bnQpO1xuICAgICAgICAgICAgJCh0aGlzLndyYXBwZXJVc2Vycykub24oJ2NsaWNrJywgJy51cGRhdGVVc2VyQnV0dG9uJywgdGhpcy51cGRhdGVVc2VyKTtcbiAgICAgICAgICAgICQodGhpcy53cmFwcGVyVXNlcnMpLm9uKCdjbGljaycsICcucGFzc3dvcmRSZXNldCcsIHRoaXMucGFzc3dvcmRSZXNldCk7XG4gICAgICAgICAgICAkKHRoaXMud3JhcHBlclVzZXJzKS5vbignY2xpY2snLCAnLmRlbGV0ZVVzZXJCdXR0b24nLCB0aGlzLmRlbGV0ZVVzZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNyZWF0ZXMgYSBuZXcgdXNlciBhY2NvdW50XG4gICAgICAgICovXG4gICAgICAgIGNyZWF0ZUFjY291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FsbCBpdGVtcyBwcmVzZW50P1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjZmlyc3RuYW1lJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNuZXdVc2VyTW9kYWwgZm9ybSBpbnB1dCNmaXJzdG5hbWUnKS5wYXJlbnQoKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNuZXdVc2VyTW9kYWwgZm9ybSBpbnB1dCNmaXJzdG5hbWUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XHRcdFx0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjbGFzdG5hbWUnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCBmb3JtIGlucHV0I2xhc3RuYW1lJykucGFyZW50KCkuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjbGFzdG5hbWUnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjZW1haWwnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCBmb3JtIGlucHV0I2VtYWlsJykucGFyZW50KCkuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjZW1haWwnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjcGFzc3dvcmQnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCBmb3JtIGlucHV0I3Bhc3N3b3JkJykucGFyZW50KCkuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjbmV3VXNlck1vZGFsIGZvcm0gaW5wdXQjcGFzc3dvcmQnKS5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICB9XG5cdFx0XG4gICAgICAgICAgICBpZiggYWxsR29vZCA9PT0gMSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBvbGQgYWxlcnRzXG4gICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCAubW9kYWwtYWxlcnRzID4gKicpLmhpZGUoKTtcblxuICAgICAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgICAgICQoJyNuZXdVc2VyTW9kYWwgLmxvYWRlcicpLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJCgnI25ld1VzZXJNb2RhbCBmb3JtJykuYXR0cignYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogICQoJyNuZXdVc2VyTW9kYWwgZm9ybScpLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXQpe1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAkKCdidXR0b24jYnV0dG9uQ3JlYXRlQWNjb3VudCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vaGlkZSBsb2FkZXJcbiAgICAgICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCAubG9hZGVyJykuaGlkZSgpO1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugey8vYWxsIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI25ld1VzZXJNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXNlcnMgPiAqJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXNlcnMnKS5hcHBlbmQoICQocmV0LnVzZXJzKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3VzZXJzIGZvcm0gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuY2hlY2tib3goKTtcblx0XHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgICgnLnVzZXJTaXRlcyAuc2l0ZSBpZnJhbWUnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhlSGVpZ2h0ID0gJCh0aGlzKS5hdHRyKCdkYXRhLWhlaWdodCcpKjAuMjU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS53aWR0aCggICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS56b29tZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b29tOiAwLjI1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICQodGhpcykuY2xvc2VzdCgnLnRhYi1wYW5lJykud2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVVSTDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL1wiKyQodGhpcykuYXR0cignZGF0YS1zaXRlaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLnNpdGUnKS5maW5kKCcuem9vbWVyLWNvdmVyID4gYScpLmF0dHIoJ3RhcmdldCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVzIGEgdXNlclxuICAgICAgICAqL1xuICAgICAgICB1cGRhdGVVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uXG4gICAgICAgICAgICB2YXIgdGhlQnV0dG9uID0gJCh0aGlzKTtcdFx0XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXHRcbiAgICAgICAgICAgIC8vc2hvdyBsb2FkZXJcbiAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmJvdHRvbScpLmZpbmQoJy5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6ICQodGhpcykuY2xvc2VzdCgnZm9ybScpLmF0dHIoJ2FjdGlvbicpLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGRhdGE6ICQodGhpcykuY2xvc2VzdCgnZm9ybScpLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG5cdFx0XG4gICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgdGhlQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgLy9oaWRlIGxvYWRlclxuICAgICAgICAgICAgICAgIHRoZUJ1dHRvbi5jbG9zZXN0KCcuYm90dG9tJykuZmluZCgnLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVCdXR0b24uY2xvc2VzdCgnLmJvdHRvbScpLmZpbmQoJy5hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHJldC5yZXNwb25zZUNvZGUgPT09IDEpIHsvL2FsbCBnb29kXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVCdXR0b24uY2xvc2VzdCgnLmJvdHRvbScpLmZpbmQoJy5hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hcHBlbmQgdXNlciBkZXRhaWwgZm9ybVxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhlUGFuZSA9IHRoZUJ1dHRvbi5jbG9zZXN0KCcudGFiLXBhbmUnKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVBhbmUuY2xvc2VzdCgnLmJvdHRvbScpLmZpbmQoJy5hbGVydC1zdWNjZXNzJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7JCh0aGlzLnJlbW92ZSgpKTt9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVCdXR0b24uY2xvc2VzdCgnZm9ybScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlUGFuZS5wcmVwZW5kKCAkKHJldC51c2VyRGV0YWlsRm9ybSkgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhlUGFuZS5maW5kKCdmb3JtIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmNoZWNrYm94KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBwYXNzd29yZCByZXNldFxuICAgICAgICAqL1xuICAgICAgICBwYXNzd29yZFJlc2V0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRoZUJ1dHRvbiA9ICQodGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGlzYWJsZSBidXR0b25zXG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYm90dG9tJykuZmluZCgnLnVwZGF0ZVVzZXJCdXR0b24nKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCcuYm90dG9tJykuZmluZCgnLmxvYWRlcicpLmZhZGVJbigpO1xuXHRcdFxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJ1c2Vycy9ycHcvXCIrJCh0aGlzKS5hdHRyKCdkYXRhLXVzZXJpZCcpLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uc1xuICAgICAgICAgICAgICAgIHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB0aGVCdXR0b24uY2xvc2VzdCgnLmJvdHRvbScpLmZpbmQoJy51cGRhdGVVc2VyQnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICAvL2hpZGUgbG9hZGVyXG4gICAgICAgICAgICAgICAgdGhlQnV0dG9uLmNsb3Nlc3QoJy5ib3R0b20nKS5maW5kKCcubG9hZGVyJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICQodGhlQnV0dG9uKS5jbG9zZXN0KCcuYm90dG9tJykuZmluZCgnLmFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3Jcblx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgZ29vZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUJ1dHRvbi5jbG9zZXN0KCcuYm90dG9tJykuZmluZCgnLmFsZXJ0cyA+IConKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXskKHRoaXMpLnJlbW92ZSgpO30pO1xuICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgYSB1c2VyIGFjY291bnRcbiAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlVXNlcjogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2V0dXAgZGVsZXRlIGxpbmtcbiAgICAgICAgICAgICQoJyNkZWxldGVVc2VyTW9kYWwgYSNkZWxldGVVc2VyQnV0dG9uJykuYXR0cignaHJlZicsICQodGhpcykuYXR0cignaHJlZicpKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9tb2RhbFxuICAgICAgICAgICAgJCgnI2RlbGV0ZVVzZXJNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIHVzZXJzLmluaXQoKTtcblx0XG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHJlcXVpcmUoJy4vbW9kdWxlcy91aScpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvdXNlcnMnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL2FjY291bnQnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL3NpdGVzZXR0aW5ncycpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvc2l0ZXMnKTtcblxuXHQkKCcudXNlclNpdGVzIC5zaXRlIGlmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICBcdCAgICBcdFxuICAgICAgICB2YXIgdGhlSGVpZ2h0ID0gJCh0aGlzKS5hdHRyKCdkYXRhLWhlaWdodCcpKjAuMjU7XG4gICAgXHRcdFxuICAgICAgICAvL2FsZXJ0KCQodGhpcykuY2xvc2VzdCgnLnRhYi1jb250ZW50JykuaW5uZXJXaWR0aCgpKVxuICAgIFx0XHQgICAgXHQgICAgXHRcbiAgICAgICAgJCh0aGlzKS56b29tZXIoe1xuICAgICAgICAgICAgem9vbTogMC4yMCxcbiAgICAgICAgICAgIGhlaWdodDogdGhlSGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6ICQodGhpcykuY2xvc2VzdCgnLnRhYi1jb250ZW50Jykud2lkdGgoKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgICBtZXNzYWdlVVJMOiBcIjw/cGhwIGVjaG8gc2l0ZV91cmwoJ3NpdGVzJyk/Pi9cIiskKHRoaXMpLmF0dHIoJ2RhdGEtc2l0ZWlkJylcbiAgICAgICAgfSk7XG4gICAgXHRcdFxuICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5zaXRlJykuZmluZCgnLnpvb21lci1jb3ZlciA+IGEnKS5hdHRyKCd0YXJnZXQnLCAnJyk7XG4gICAgXHRcbiAgICB9KVxuXG59KCkpOyJdfQ==
