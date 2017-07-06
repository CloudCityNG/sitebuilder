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
},{"./ui.js":7}],2:[function(require,module,exports){
(function () {
	"use strict";

    var siteBuilderUtils = require('./utils.js');
    var bConfig = require('./config.js');
    var appUI = require('./ui.js').appUI;
    var publisher = require('../vendor/publisher');


	 /*
        Basic Builder UI initialisation
    */
    var builderUI = {
        
        allBlocks: {},                                              //holds all blocks loaded from the server
        menuWrapper: document.getElementById('menu'),
        primarySideMenuWrapper: document.getElementById('main'),
        buttonBack: document.getElementById('backButton'),
        buttonBackConfirm: document.getElementById('leavePageButton'),
        
        aceEditors: {},
        frameContents: '',                                      //holds frame contents
        templateID: 0,                                          //holds the template ID for a page (???)
                
        modalDeleteBlock: document.getElementById('deleteBlock'),
        modalResetBlock: document.getElementById('resetBlock'),
        modalDeletePage: document.getElementById('deletePage'),
        buttonDeletePageConfirm: document.getElementById('deletePageConfirm'),
        
        dropdownPageLinks: document.getElementById('internalLinksDropdown'),

        pageInUrl: null,
        
        tempFrame: {},

        currentResponsiveMode: {},
                
        init: function(){
                                                
            //load blocks
            $.getJSON(appUI.baseUrl+'elements.json?v=12345678', function(data){ builderUI.allBlocks = data; builderUI.implementBlocks(); });
            
            //sitebar hover animation action
            $(this.menuWrapper).on('mouseenter', function(){
                
                $(this).stop().animate({'left': '0px'}, 500);
                
            }).on('mouseleave', function(){
                
                $(this).stop().animate({'left': '-190px'}, 500);
                
                $('#menu #main a').removeClass('active');
                $('.menu .second').stop().animate({
                    width: 0
                }, 500, function(){
                    $('#menu #second').hide();
                });
                
            });
            
            //prevent click event on ancors in the block section of the sidebar
            $(this.primarySideMenuWrapper).on('click', 'a:not(.actionButtons)', function(e){e.preventDefault();});
            
            $(this.buttonBack).on('click', this.backButton);
            $(this.buttonBackConfirm).on('click', this.backButtonConfirm);
            
            //notify the user of pending chnages when clicking the back button
            $(window).bind('beforeunload', function(){
                if( site.pendingChanges === true ) {
                    return 'Your site contains changed which haven\'t been saved yet. Are you sure you want to leave?';
                }
            });
                                                
            //URL parameters
            builderUI.pageInUrl = siteBuilderUtils.getParameterByName('p');

        },
        
        
        /*
            builds the blocks into the site bar
        */
        implementBlocks: function() {

            var newItem, loaderFunction;
            
            for( var key in this.allBlocks.elements ) {
                
                var niceKey = key.toLowerCase().replace(" ", "_");
                
                $('<li><a href="" id="'+niceKey+'">'+key+'</a></li>').appendTo('#menu #main ul#elementCats');
                
                for( var x = 0; x < this.allBlocks.elements[key].length; x++ ) {
                    
                    if( this.allBlocks.elements[key][x].thumbnail === null ) {//we'll need an iframe
                        
                        //build us some iframes!
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" scrolling="no" sandbox="allow-same-origin"></iframe></li>');
                        
                        } else {
                            
                            newItem = $('<li class="element '+niceKey+'"><iframe src="about:blank" scrolling="no"></iframe></li>');
                        
                        }
                        
                        newItem.find('iframe').uniqueId();
                        newItem.find('iframe').attr('src', appUI.baseUrl+this.allBlocks.elements[key][x].url);
                    
                    } else {//we've got a thumbnail
                        
                        if( this.allBlocks.elements[key][x].sandbox ) {
                            
                            if( this.allBlocks.elements[key][x].loaderFunction ) {
                                loaderFunction = 'data-loaderfunction="'+this.allBlocks.elements[key][x].loaderFunction+'"';
                            }
                            
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'" data-sandbox="" '+loaderFunction+'></li>');
                            
                        } else {
                                
                            newItem = $('<li class="element '+niceKey+'"><img src="'+appUI.baseUrl+this.allBlocks.elements[key][x].thumbnail+'" data-srcc="'+appUI.baseUrl+this.allBlocks.elements[key][x].url+'" data-height="'+this.allBlocks.elements[key][x].height+'"></li>');
                                
                        }
                    }
                    
                    newItem.appendTo('#menu #second ul#elements');
            
                    //zoomer works

                    var theHeight;
                    
                    if( this.allBlocks.elements[key][x].height ) {
                        
                        theHeight = this.allBlocks.elements[key][x].height*0.25;
                    
                    } else {
                        
                        theHeight = 'auto';
                        
                    }
                    
                    newItem.find('iframe').zoomer({
                        zoom: 0.25,
                        width: 270,
                        height: theHeight,
                        message: "Drag&Drop Me!"
                    });
                
                }
            
            }
            
            //draggables
            builderUI.makeDraggable();
            
        },
                
        
        /*
            event handler for when the back link is clicked
        */
        backButton: function() {
            
            if( site.pendingChanges === true ) {
                $('#backModal').modal('show');
                return false;
            }
            
        },
        
        
        /*
            button for confirming leaving the page
        */
        backButtonConfirm: function() {
            
            site.pendingChanges = false;//prevent the JS alert after confirming user wants to leave
            
        },
                
       
        /*
            makes the blocks and templates in the sidebar draggable onto the canvas
        */
        makeDraggable: function() {
                        
            $('#elements li, #templates li').each(function(){

                $(this).draggable({
                    helper: function() {
                        return $('<div style="height: 100px; width: 300px; background: #F9FAFA; box-shadow: 5px 5px 1px rgba(0,0,0,0.1); text-align: center; line-height: 100px; font-size: 28px; color: #16A085"><span class="fui-list"></span></div>');
                    },
                    revert: 'invalid',
                    appendTo: 'body',
                    connectToSortable: '#pageList > ul',
                    start: function () {
                        site.moveMode('on');
                    },
                    stop: function () {}
                }); 
            
            });
            
            $('#elements li a').each(function(){
                
                $(this).unbind('click').bind('click', function(e){
                    e.preventDefault();
                });
            
            });
            
        },
        
        
        /*
            Implements the site on the canvas, called from the Site object when the siteData has completed loading
        */
        populateCanvas: function() {

            var i,
                counter = 1;
                        
            //loop through the pages
                                    
            for( i in site.pages ) {
                
                var newPage = new Page(i, site.pages[i], counter);
                                            
                counter++;

                //set this page as active?
                if( builderUI.pageInUrl === i ) {
                    newPage.selectPage();
                }
                                
            }
            
            //activate the first page
            if(site.sitePages.length > 0 && builderUI.pageInUrl === null) {
                site.sitePages[0].selectPage();
            }
                                    
        },


        /*
            Canvas loading on/off
        */
        canvasLoading: function (value) {

            if ( value === 'on' && document.getElementById('frameWrapper').querySelectorAll('#canvasOverlay').length === 0 ) {

                var overlay = document.createElement('DIV');

                overlay.style.display = 'flex';
                $(overlay).hide();
                overlay.id = 'canvasOverlay';

                overlay.innerHTML = '<div class="loader"><span>{</span><span>}</span></div>';

                document.getElementById('frameWrapper').appendChild(overlay);

                $('#canvasOverlay').fadeIn(500);

            } else if ( value === 'off' && document.getElementById('frameWrapper').querySelectorAll('#canvasOverlay').length === 1 ) {

                site.loaded();

                $('#canvasOverlay').fadeOut(500, function () {
                    this.remove();
                });

            }

        }
        
    };


    /*
        Page constructor
    */
    function Page (pageName, page, counter) {
    
        this.name = pageName || "";
        this.pageID = page.page_id || 0;
        this.blocks = [];
        this.parentUL = {}; //parent UL on the canvas
        this.status = '';//'', 'new' or 'changed'
        this.scripts = [];//tracks script URLs used on this page
        
        this.pageSettings = {
            title: page.pages_title || '',
            meta_description: page.meta_description || '',
            meta_keywords: page.meta_keywords || '',
            header_includes: page.header_includes || '',
            page_css: page.page_css || ''
        };
                
        this.pageMenuTemplate = '<a href="" class="menuItemLink">page</a><span class="pageButtons"><a href="" class="fileEdit fui-new"></a><a href="" class="fileDel fui-cross"><a class="btn btn-xs btn-primary btn-embossed fileSave fui-check" href="#"></a></span></a></span>';
        
        this.menuItem = {};//reference to the pages menu item for this page instance
        this.linksDropdownItem = {};//reference to the links dropdown item for this page instance
        
        this.parentUL = document.createElement('UL');
        this.parentUL.setAttribute('id', "page"+counter);
                
        /*
            makes the clicked page active
        */
        this.selectPage = function() {
            
            //console.log('select:');
            //console.log(this.pageSettings);
                        
            //mark the menu item as active
            site.deActivateAll();
            $(this.menuItem).addClass('active');
                        
            //let Site know which page is currently active
            site.setActive(this);
            
            //display the name of the active page on the canvas
            site.pageTitle.innerHTML = this.name;
            
            //load the page settings into the page settings modal
            site.inputPageSettingsTitle.value = this.pageSettings.title;
            site.inputPageSettingsMetaDescription.value = this.pageSettings.meta_description;
            site.inputPageSettingsMetaKeywords.value = this.pageSettings.meta_keywords;
            site.inputPageSettingsIncludes.value = this.pageSettings.header_includes;
            site.inputPageSettingsPageCss.value = this.pageSettings.page_css;
                          
            //trigger custom event
            $('body').trigger('changePage');
            
            //reset the heights for the blocks on the current page
            for( var i in this.blocks ) {
                
                if( Object.keys(this.blocks[i].frameDocument).length > 0 ){
                    this.blocks[i].heightAdjustment();
                }
            
            }
            
            //show the empty message?
            this.isEmpty();
                                    
        };
        
        /*
            changed the location/order of a block within a page
        */
        this.setPosition = function(frameID, newPos) {
            
            //we'll need the block object connected to iframe with frameID
            
            for(var i in this.blocks) {
                
                if( this.blocks[i].frame.getAttribute('id') === frameID ) {
                    
                    //change the position of this block in the blocks array
                    this.blocks.splice(newPos, 0, this.blocks.splice(i, 1)[0]);
                    
                }
                
            }
                        
        };
        
        /*
            delete block from blocks array
        */
        this.deleteBlock = function(block) {
            
            //remove from blocks array
            for( var i in this.blocks ) {
                if( this.blocks[i] === block ) {
                    //found it, remove from blocks array
                    this.blocks.splice(i, 1);
                }
            }
            
            site.setPendingChanges(true);
            
        };
        
        /*
            toggles all block frameCovers on this page
        */
        this.toggleFrameCovers = function(onOrOff) {
            
            for( var i in this.blocks ) {
                                 
                this.blocks[i].toggleCover(onOrOff);
                
            }
            
        };
        
        /*
            setup for editing a page name
        */
        this.editPageName = function() {
            
            if( !this.menuItem.classList.contains('edit') ) {
            
                //hide the link
                this.menuItem.querySelector('a.menuItemLink').style.display = 'none';
            
                //insert the input field
                var newInput = document.createElement('input');
                newInput.type = 'text';
                newInput.setAttribute('name', 'page');
                newInput.setAttribute('value', this.name);
                this.menuItem.insertBefore(newInput, this.menuItem.firstChild);
                    
                newInput.focus();
        
                var tmpStr = newInput.getAttribute('value');
                newInput.setAttribute('value', '');
                newInput.setAttribute('value', tmpStr);
                            
                this.menuItem.classList.add('edit');
            
            }
            
        };
        
        /*
            Updates this page's name (event handler for the save button)
        */
        this.updatePageNameEvent = function(el) {
            
            if( this.menuItem.classList.contains('edit') ) {
            
                //el is the clicked button, we'll need access to the input
                var theInput = this.menuItem.querySelector('input[name="page"]');
                
                //make sure the page's name is OK
                if( site.checkPageName(theInput.value) ) {
                   
                    this.name = site.prepPageName( theInput.value );
            
                    this.menuItem.querySelector('input[name="page"]').remove();
                    this.menuItem.querySelector('a.menuItemLink').innerHTML = this.name;
                    this.menuItem.querySelector('a.menuItemLink').style.display = 'block';
            
                    this.menuItem.classList.remove('edit');
                
                    //update the links dropdown item
                    this.linksDropdownItem.text = this.name;
                    this.linksDropdownItem.setAttribute('value', this.name+".html");
                    
                    //update the page name on the canvas
                    site.pageTitle.innerHTML = this.name;
            
                    //changed page title, we've got pending changes
                    site.setPendingChanges(true);
                                        
                } else {
                    
                    alert(site.pageNameError);
                    
                }
                                        
            }
            
        };
        
        /*
            deletes this entire page
        */
        this.delete = function() {
                        
            //delete from the Site
            for( var i in site.sitePages ) {
                
                if( site.sitePages[i] === this ) {//got a match!
                    
                    //delete from site.sitePages
                    site.sitePages.splice(i, 1);
                    
                    //delete from canvas
                    this.parentUL.remove();
                    
                    //add to deleted pages
                    site.pagesToDelete.push(this.name);
                    
                    //delete the page's menu item
                    this.menuItem.remove();
                    
                    //delet the pages link dropdown item
                    this.linksDropdownItem.remove();
                    
                    //activate the first page
                    site.sitePages[0].selectPage();
                    
                    //page was deleted, so we've got pending changes
                    site.setPendingChanges(true);
                    
                }
                
            }
                        
        };
        
        /*
            checks if the page is empty, if so show the 'empty' message
        */
        this.isEmpty = function() {
            
            if( this.blocks.length === 0 ) {
                
                site.messageStart.style.display = 'block';
                site.divFrameWrapper.classList.add('empty');
                             
            } else {
                
                site.messageStart.style.display = 'none';
                site.divFrameWrapper.classList.remove('empty');
                
            }
                        
        };
            
        /*
            preps/strips this page data for a pending ajax request
        */
        this.prepForSave = function() {
            
            var page = {};
                    
            page.name = this.name;
            page.pageSettings = this.pageSettings;
            page.status = this.status;
            page.pageID = this.pageID;
            page.blocks = [];
                    
            //process the blocks
                    
            for( var x = 0; x < this.blocks.length; x++ ) {
                        
                var block = {};
                        
                if( this.blocks[x].sandbox ) {
                            
                    block.frameContent = "<html>"+$('#sandboxes #'+this.blocks[x].sandbox).contents().find('html').html()+"</html>";
                    block.sandbox = true;
                    block.loaderFunction = this.blocks[x].sandbox_loader;
                            
                } else {
                                                        
                    block.frameContent = this.blocks[x].getSource();
                    block.sandbox = false;
                    block.loaderFunction = '';
                            
                }
                        
                block.frameHeight = this.blocks[x].frameHeight;
                block.originalUrl = this.blocks[x].originalUrl;
                if ( this.blocks[x].global ) block.frames_global = true;
                                                                
                page.blocks.push(block);
                        
            }
            
            return page;
            
        };
            
        /*
            generates the full page, using skeleton.html
        */
        this.fullPage = function() {
            
            var page = this;//reference to self for later
            page.scripts = [];//make sure it's empty, we'll store script URLs in there later
                        
            var newDocMainParent = $('iframe#skeleton').contents().find( bConfig.pageContainer );
            
            //empty out the skeleton first
            $('iframe#skeleton').contents().find( bConfig.pageContainer ).html('');
            
            //remove old script tags
            $('iframe#skeleton').contents().find( 'script' ).each(function(){
                $(this).remove();
            });

            var theContents;
                        
            for( var i in this.blocks ) {
                
                //grab the block content
                if (this.blocks[i].sandbox !== false) {
                                
                    theContents = $('#sandboxes #'+this.blocks[i].sandbox).contents().find( bConfig.pageContainer ).clone();
                            
                } else {
                                
                    theContents = $(this.blocks[i].frameDocument.body).find( bConfig.pageContainer ).clone();
                            
                }
                                
                //remove video frameCovers
                theContents.find('.frameCover').each(function () {
                    $(this).remove();
                });
                
                //remove video frameWrappers
                theContents.find('.videoWrapper').each(function(){
                    
                    var cnt = $(this).contents();
                    $(this).replaceWith(cnt);
                    
                });
                
                //remove style leftovers from the style editor
                for( var key in bConfig.editableItems ) {
                                                                
                    theContents.find( key ).each(function(){
                                                                        
                        $(this).removeAttr('data-selector');
                        
                        $(this).css('outline', '');
                        $(this).css('outline-offset', '');
                        $(this).css('cursor', '');
                                                                        
                        if( $(this).attr('style') === '' ) {
                                        
                            $(this).removeAttr('style');
                                    
                        }
                                
                    });
                            
                }
                
                //remove style leftovers from the content editor
                for ( var x = 0; x < bConfig.editableContent.length; ++x) {
                                
                    theContents.find( bConfig.editableContent[x] ).each(function(){
                                    
                        $(this).removeAttr('data-selector');
                                
                    });
                            
                }
                
                //append to DOM in the skeleton
                newDocMainParent.append( $(theContents.html()) );
                
                //do we need to inject any scripts?
                var scripts = $(this.blocks[i].frameDocument.body).find('script');
                var theIframe = document.getElementById("skeleton");
                                            
                if( scripts.size() > 0 ) {
                                
                    scripts.each(function(){

                        var script;
                                    
                        if( $(this).text() !== '' ) {//script tags with content
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.innerHTML = $(this).text();
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                                    
                        } else if( $(this).attr('src') !== null && page.scripts.indexOf($(this).attr('src')) === -1 ) {
                            //use indexOf to make sure each script only appears on the produced page once
                                        
                            script = theIframe.contentWindow.document.createElement("script");
                            script.type = 'text/javascript';
                            script.src = $(this).attr('src');
                                        
                            theIframe.contentWindow.document.body.appendChild(script);
                            
                            page.scripts.push($(this).attr('src'));
                                    
                        }
                                
                    });
                            
                }
            
            }
                        
        };


        /*
            Checks if all blocks on this page have finished loading
        */
        this.loaded = function () {

            var i;

            for ( i = 0; i <this.blocks.length; i++ ) {

                if ( !this.blocks[i].loaded ) return false;

            }

            return true;

        };
            
        /*
            clear out this page
        */
        this.clear = function() {
            
            var block = this.blocks.pop();
            
            while( block !== undefined ) {
                
                block.delete();
                
                block = this.blocks.pop();
                
            }
                                    
        };


        /*
            Height adjustment for all blocks on the page
        */
        this.heightAdjustment = function () {

            for ( var i = 0; i < this.blocks.length; i++ ) {
                this.blocks[i].heightAdjustment();
            }

        };
         
        
        //loop through the frames/blocks
        
        if( page.hasOwnProperty('blocks') ) {
        
            for( var x = 0; x < page.blocks.length; x++ ) {
            
                //create new Block
            
                var newBlock = new Block();
            
                page.blocks[x].src = appUI.siteUrl+"sites/getframe/"+page.blocks[x].frames_id;
                
                //sandboxed block?
                if( page.blocks[x].frames_sandbox === '1') {
                                        
                    newBlock.sandbox = true;
                    newBlock.sandbox_loader = page.blocks[x].frames_loaderfunction;
                
                }
                
                newBlock.frameID = page.blocks[x].frames_id;
                if ( page.blocks[x].frames_global === '1' ) newBlock.global = true;
                newBlock.createParentLI(page.blocks[x].frames_height);
                newBlock.createFrame(page.blocks[x]);
                newBlock.createFrameCover();
                newBlock.insertBlockIntoDom(this.parentUL);

                console.log(newBlock);
                                                                    
                //add the block to the new page
                this.blocks.push(newBlock);
                                        
            }
            
        }
        
        //add this page to the site object
        site.sitePages.push( this );
        
        //plant the new UL in the DOM (on the canvas)
        site.divCanvas.appendChild(this.parentUL);
        
        //make the blocks/frames in each page sortable
        
        var thePage = this;
        
        $(this.parentUL).sortable({
            revert: true,
            placeholder: "drop-hover",
            handle: '.dragBlock',
            cancel: '',
            stop: function () {
                site.moveMode('off');
                site.setPendingChanges(true);
                if ( !site.loaded() ) builderUI.canvasLoading('on');
            },
            beforeStop: function(event, ui){
                
                //template or regular block?
                var attr = ui.item.attr('data-frames');

                var newBlock;
                    
                if (typeof attr !== typeof undefined && attr !== false) {//template, build it
                 
                    $('#start').hide();
                                        
                    //clear out all blocks on this page    
                    thePage.clear();
                                            
                    //create the new frames
                    var frameIDs = ui.item.attr('data-frames').split('-');
                    var heights = ui.item.attr('data-heights').split('-');
                    var urls = ui.item.attr('data-originalurls').split('-');
                        
                    for( var x = 0; x < frameIDs.length; x++) {
                                                
                        newBlock = new Block();
                        newBlock.createParentLI(heights[x]);
                        
                        var frameData = {};
                        
                        frameData.src = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_original_url = appUI.siteUrl+'sites/getframe/'+frameIDs[x];
                        frameData.frames_height = heights[x];
                        
                        newBlock.createFrame( frameData );
                        newBlock.createFrameCover();
                        newBlock.insertBlockIntoDom(thePage.parentUL);
                        
                        //add the block to the new page
                        thePage.blocks.push(newBlock);
                        
                        //dropped element, so we've got pending changes
                        site.setPendingChanges(true);
                            
                    }
                
                    //set the tempateID
                    builderUI.templateID = ui.item.attr('data-pageid');
                                                                                    
                    //make sure nothing gets dropped in the lsit
                    ui.item.html(null);
                        
                    //delete drag place holder
                    $('body .ui-sortable-helper').remove();
                    
                } else {//regular block
                
                    //are we dealing with a new block being dropped onto the canvas, or a reordering og blocks already on the canvas?
                
                    if( ui.item.find('.frameCover > button').size() > 0 ) {//re-ordering of blocks on canvas
                    
                        //no need to create a new block object, we simply need to make sure the position of the existing block in the Site object
                        //is changed to reflect the new position of the block on th canvas
                    
                        var frameID = ui.item.find('iframe').attr('id');
                        var newPos = ui.item.index();
                    
                        site.activePage.setPosition(frameID, newPos);
                                        
                    } else {//new block on canvas
                                                
                        //new block                    
                        newBlock = new Block();
                                
                        newBlock.placeOnCanvas(ui);
                                    
                    }
                    
                }
                
            },
            start: function (event, ui) {

                site.moveMode('on');
                    
                if( ui.item.find('.frameCover').size() !== 0 ) {
                    builderUI.frameContents = ui.item.find('iframe').contents().find( bConfig.pageContainer ).html();
                }
            
            },
            over: function(){
                    
                $('#start').hide();
                
            }
        });
        
        //add to the pages menu
        this.menuItem = document.createElement('LI');
        this.menuItem.innerHTML = this.pageMenuTemplate;
        
        $(this.menuItem).find('a:first').text(pageName).attr('href', '#page'+counter);
        
        var theLink = $(this.menuItem).find('a:first').get(0);
        
        //bind some events
        this.menuItem.addEventListener('click', this, false);
        
        this.menuItem.querySelector('a.fileEdit').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileSave').addEventListener('click', this, false);
        this.menuItem.querySelector('a.fileDel').addEventListener('click', this, false);
        
        //add to the page link dropdown
        this.linksDropdownItem = document.createElement('OPTION');
        this.linksDropdownItem.setAttribute('value', pageName+".html");
        this.linksDropdownItem.text = pageName;
                
        builderUI.dropdownPageLinks.appendChild( this.linksDropdownItem );
        
        site.pagesMenu.appendChild(this.menuItem);
                    
    }
    
    Page.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "click": 
                                
                if( event.target.classList.contains('fileEdit') ) {
                
                    this.editPageName();
                    
                } else if( event.target.classList.contains('fileSave') ) {
                                        
                    this.updatePageNameEvent(event.target);
                
                } else if( event.target.classList.contains('fileDel') ) {
                    
                    var thePage = this;
                
                    $(builderUI.modalDeletePage).modal('show');
                    
                    $(builderUI.modalDeletePage).off('click', '#deletePageConfirm').on('click', '#deletePageConfirm', function() {
                        
                        thePage.delete();
                        
                        $(builderUI.modalDeletePage).modal('hide');
                        
                    });
                                        
                } else {
                    
                    this.selectPage();
                
                }
                
        }
    };


    /*
        Block constructor
    */
    function Block () {
        
        this.frameID = 0;
        this.loaded = false;
        this.sandbox = false;
        this.sandbox_loader = '';
        this.status = '';//'', 'changed' or 'new'
        this.global = false;
        this.originalUrl = '';
        
        this.parentLI = {};
        this.frameCover = {};
        this.frame = {};
        this.frameDocument = {};
        this.frameHeight = 0;
        
        this.annot = {};
        this.annotTimeout = {};
        
        /*
            creates the parent container (LI)
        */
        this.createParentLI = function(height) {
            
            this.parentLI = document.createElement('LI');
            this.parentLI.setAttribute('class', 'element');
            //this.parentLI.setAttribute('style', 'height: '+height+'px');
            
        };
        
        /*
            creates the iframe on the canvas
        */
        this.createFrame = function(frame) {
                        
            this.frame = document.createElement('IFRAME');
            this.frame.setAttribute('frameborder', 0);
            this.frame.setAttribute('scrolling', 0);
            this.frame.setAttribute('src', frame.src);
            this.frame.setAttribute('data-originalurl', frame.frames_original_url);
            this.originalUrl = frame.frames_original_url;
            //this.frame.setAttribute('data-height', frame.frames_height);
            //this.frameHeight = frame.frames_height;
                        
            $(this.frame).uniqueId();
            
            //sandbox?
            if( this.sandbox !== false ) {
                            
                this.frame.setAttribute('data-loaderfunction', this.sandbox_loader);
                this.frame.setAttribute('data-sandbox', this.sandbox);
                            
                //recreate the sandboxed iframe elsewhere
                var sandboxedFrame = $('<iframe src="'+frame.src+'" id="'+this.sandbox+'" sandbox="allow-same-origin"></iframe>');
                $('#sandboxes').append( sandboxedFrame );
                            
            }
                        
        };
            
        /*
            insert the iframe into the DOM on the canvas
        */
        this.insertBlockIntoDom = function(theUL) {
            
            this.parentLI.appendChild(this.frame);
            theUL.appendChild( this.parentLI );
            
            this.frame.addEventListener('load', this, false);

            builderUI.canvasLoading('on');
            
        };
            
        /*
            sets the frame document for the block's iframe
        */
        this.setFrameDocument = function() {
            
            //set the frame document as well
            if( this.frame.contentDocument ) {
                this.frameDocument = this.frame.contentDocument;   
            } else {
                this.frameDocument = this.frame.contentWindow.document;
            }
            
            //this.heightAdjustment();
                                    
        };
        
        /*
            creates the frame cover and block action button
        */
        this.createFrameCover = function() {
            
            //build the frame cover and block action buttons
            this.frameCover = document.createElement('DIV');
            this.frameCover.classList.add('frameCover');
            this.frameCover.classList.add('fresh');
                    
            var delButton = document.createElement('BUTTON');
            delButton.setAttribute('class', 'btn btn-inverse btn-sm deleteBlock');
            delButton.setAttribute('type', 'button');
            delButton.innerHTML = '<i class="fui-trash"></i> <span>remove</span>';
            delButton.addEventListener('click', this, false);
                    
            var resetButton = document.createElement('BUTTON');
            resetButton.setAttribute('class', 'btn btn-inverse btn-sm resetBlock');
            resetButton.setAttribute('type', 'button');
            resetButton.innerHTML = '<i class="fa fa-refresh"></i> <span>reset</span>';
            resetButton.addEventListener('click', this, false);
                    
            var htmlButton = document.createElement('BUTTON');
            htmlButton.setAttribute('class', 'btn btn-inverse btn-sm htmlBlock');
            htmlButton.setAttribute('type', 'button');
            htmlButton.innerHTML = '<i class="fa fa-code"></i> <span>source</span>';
            htmlButton.addEventListener('click', this, false);

            var dragButton = document.createElement('BUTTON');
            dragButton.setAttribute('class', 'btn btn-inverse btn-sm dragBlock');
            dragButton.setAttribute('type', 'button');
            dragButton.innerHTML = '<i class="fa fa-arrows"></i> <span>Move</span>';
            dragButton.addEventListener('click', this, false);

            var globalLabel = document.createElement('LABEL');
            globalLabel.classList.add('checkbox');
            globalLabel.classList.add('primary');
            var globalCheckbox = document.createElement('INPUT');
            globalCheckbox.type = 'checkbox';
            globalCheckbox.setAttribute('data-toggle', 'checkbox');
            globalCheckbox.checked = this.global;
            globalLabel.appendChild(globalCheckbox);
            var globalText = document.createTextNode('Global');
            globalLabel.appendChild(globalText);

            var trigger = document.createElement('span');
            trigger.classList.add('fui-gear');
                    
            this.frameCover.appendChild(delButton);
            this.frameCover.appendChild(resetButton);
            this.frameCover.appendChild(htmlButton);
            this.frameCover.appendChild(dragButton);
            this.frameCover.appendChild(globalLabel);
            this.frameCover.appendChild(trigger);
                            
            this.parentLI.appendChild(this.frameCover);

            var theBlock = this;

            $(globalCheckbox).on('change', function (e) {

                theBlock.toggleGlobal(e);

            }).radiocheck();
                                                        
        };


        /*
            
        */
        this.toggleGlobal = function (e) {

            if ( e.currentTarget.checked ) this.global = true;
            else this.global = false;

            //we've got pending changes
            site.setPendingChanges(true);

            console.log(this);

        };

            
        /*
            automatically corrects the height of the block's iframe depending on its content
        */
        this.heightAdjustment = function() {
            
            if ( Object.keys(this.frameDocument).length !== 0 ) {

                var pageContainer = this.frameDocument.body;
                var height = pageContainer.offsetHeight;

                this.frame.style.height = height+"px";
                this.parentLI.style.height = height+"px";
                //this.frameCover.style.height = height+"px";
                
                this.frameHeight = height;

            }
                                                                                    
        };
            
        /*
            deletes a block
        */
        this.delete = function() {
                        
            //remove from DOM/canvas with a nice animation
            $(this.frame.parentNode).fadeOut(500, function(){
                    
                this.remove();
                    
                site.activePage.isEmpty();
                
            });
            
            //remove from blocks array in the active page
            site.activePage.deleteBlock(this);
            
            //sanbox
            if( this.sanbdox ) {
                document.getElementById( this.sandbox ).remove();   
            }
            
            //element was deleted, so we've got pending change
            site.setPendingChanges(true);
                        
        };
            
        /*
            resets a block to it's orignal state
        */
        this.reset = function (fireEvent) {

            if ( typeof fireEvent === 'undefined') fireEvent = true;
            
            //reset frame by reloading it
            this.frame.contentWindow.location.reload();
            
            //sandbox?
            if( this.sandbox ) {
                var sandboxFrame = document.getElementById(this.sandbox).contentWindow.location.reload();  
            }
            
            //element was deleted, so we've got pending changes
            site.setPendingChanges(true);

            builderUI.canvasLoading('on');

            if ( fireEvent ) publisher.publish('onBlockChange', this, 'reload');
            
        };
            
        /*
            launches the source code editor
        */
        this.source = function() {
            
            //hide the iframe
            this.frame.style.display = 'none';
            
            //disable sortable on the parentLI
            $(this.parentLI.parentNode).sortable('disable');
            
            //built editor element
            var theEditor = document.createElement('DIV');
            theEditor.classList.add('aceEditor');
            $(theEditor).uniqueId();
            
            this.parentLI.appendChild(theEditor);
            
            //build and append error drawer
            var newLI = document.createElement('LI');
            var errorDrawer = document.createElement('DIV');
            errorDrawer.classList.add('errorDrawer');
            errorDrawer.setAttribute('id', 'div_errorDrawer');
            errorDrawer.innerHTML = '<button type="button" class="btn btn-xs btn-embossed btn-default button_clearErrorDrawer" id="button_clearErrorDrawer">CLEAR</button>';
            newLI.appendChild(errorDrawer);
            errorDrawer.querySelector('button').addEventListener('click', this, false);
            this.parentLI.parentNode.insertBefore(newLI, this.parentLI.nextSibling);
            
            ace.config.set("basePath", "/js/vendor/ace");
            
            var theId = theEditor.getAttribute('id');
            var editor = ace.edit( theId );

            //editor.getSession().setUseWrapMode(true);
            
            var pageContainer = this.frameDocument.querySelector( bConfig.pageContainer );
            var theHTML = pageContainer.innerHTML;
            

            editor.setValue( theHTML );
            editor.setTheme("ace/theme/twilight");
            editor.getSession().setMode("ace/mode/html");
            
            var block = this;
            
            
            editor.getSession().on("changeAnnotation", function(){
                
                block.annot = editor.getSession().getAnnotations();
                
                clearTimeout(block.annotTimeout);

                var timeoutCount;
                
                if( $('#div_errorDrawer p').size() === 0 ) {
                    timeoutCount = bConfig.sourceCodeEditSyntaxDelay;
                } else {
                    timeoutCount = 100;
                }
                
                block.annotTimeout = setTimeout(function(){
                                                            
                    for (var key in block.annot){
                    
                        if (block.annot.hasOwnProperty(key)) {
                        
                            if( block.annot[key].text !== "Start tag seen without seeing a doctype first. Expected e.g. <!DOCTYPE html>." ) {
                            
                                var newLine = $('<p></p>');
                                var newKey = $('<b>'+block.annot[key].type+': </b>');
                                var newInfo = $('<span> '+block.annot[key].text + "on line " + " <b>" + block.annot[key].row+'</b></span>');
                                newLine.append( newKey );
                                newLine.append( newInfo );
                    
                                $('#div_errorDrawer').append( newLine );
                        
                            }
                    
                        }
                
                    }
                
                    if( $('#div_errorDrawer').css('display') === 'none' && $('#div_errorDrawer').find('p').size() > 0 ) {
                        $('#div_errorDrawer').slideDown();
                    }
                        
                }, timeoutCount);
                
            
            });
            
            //buttons
            var cancelButton = document.createElement('BUTTON');
            cancelButton.setAttribute('type', 'button');
            cancelButton.classList.add('btn');
            cancelButton.classList.add('btn-danger');
            cancelButton.classList.add('editCancelButton');
            cancelButton.classList.add('btn-sm');
            cancelButton.innerHTML = '<i class="fui-cross"></i> <span>Cancel</span>';
            cancelButton.addEventListener('click', this, false);
            
            var saveButton = document.createElement('BUTTON');
            saveButton.setAttribute('type', 'button');
            saveButton.classList.add('btn');
            saveButton.classList.add('btn-primary');
            saveButton.classList.add('editSaveButton');
            saveButton.classList.add('btn-sm');
            saveButton.innerHTML = '<i class="fui-check"></i> <span>Save</span>';
            saveButton.addEventListener('click', this, false);
            
            var buttonWrapper = document.createElement('DIV');
            buttonWrapper.classList.add('editorButtons');
            
            buttonWrapper.appendChild( cancelButton );
            buttonWrapper.appendChild( saveButton );
            
            this.parentLI.appendChild( buttonWrapper );
            
            builderUI.aceEditors[ theId ] = editor;
            
        };
            
        /*
            cancels the block source code editor
        */
        this.cancelSourceBlock = function() {

            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
		
            //delete the errorDrawer
            $(this.parentLI.nextSibling).remove();
        
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            $(this.frame).fadeIn(500);
                        
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
        };
            
        /*
            updates the blocks source code
        */
        this.saveSourceBlock = function() {
            
            //enable draggable on the LI
            $(this.parentLI.parentNode).sortable('enable');
            
            var theId = this.parentLI.querySelector('.aceEditor').getAttribute('id');
            var theContent = builderUI.aceEditors[theId].getValue();
            
            //delete the errorDrawer
            document.getElementById('div_errorDrawer').parentNode.remove();
            
            //delete the editor
            this.parentLI.querySelector('.aceEditor').remove();
            
            //update the frame's content
            this.frameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
            this.frame.style.display = 'block';
            
            //sandboxed?
            if( this.sandbox ) {
                
                var sandboxFrame = document.getElementById( this.sandbox );
                var sandboxFrameDocument = sandboxFrame.contentDocument || sandboxFrame.contentWindow.document;
                
                builderUI.tempFrame = sandboxFrame;
                
                sandboxFrameDocument.querySelector( bConfig.pageContainer ).innerHTML = theContent;
                                
                //do we need to execute a loader function?
                if( this.sandbox_loader !== '' ) {
                    
                    /*
                    var codeToExecute = "sandboxFrame.contentWindow."+this.sandbox_loader+"()";
                    var tmpFunc = new Function(codeToExecute);
                    tmpFunc();
                    */
                    
                }
                
            }
            
            $(this.parentLI.querySelector('.editorButtons')).fadeOut(500, function(){
                $(this).remove();
            });
            
            //adjust height of the frame
            this.heightAdjustment();
            
            //new page added, we've got pending changes
            site.setPendingChanges(true);
            
            //block has changed
            this.status = 'changed';

            publisher.publish('onBlockChange', this, 'change');

        };
            
        /*
            clears out the error drawer
        */
        this.clearErrorDrawer = function() {
            
            var ps = this.parentLI.nextSibling.querySelectorAll('p');
                        
            for( var i = 0; i < ps.length; i++ ) {
                ps[i].remove();  
            }
                        
        };
            
        /*
            toggles the visibility of this block's frameCover
        */
        this.toggleCover = function(onOrOff) {
            
            if( onOrOff === 'On' ) {
                
                this.parentLI.querySelector('.frameCover').style.display = 'block';
                
            } else if( onOrOff === 'Off' ) {
             
                this.parentLI.querySelector('.frameCover').style.display = 'none';
                
            }
            
        };
            
        /*
            returns the full source code of the block's frame
        */
        this.getSource = function() {
            
            var source = "<html>";
            source += this.frameDocument.head.outerHTML;
            source += this.frameDocument.body.outerHTML;
            
            return source;
            
        };
            
        /*
            places a dragged/dropped block from the left sidebar onto the canvas
        */
        this.placeOnCanvas = function(ui) {
            
            //frame data, we'll need this before messing with the item's content HTML
            var frameData = {}, attr;
                
            if( ui.item.find('iframe').size() > 0 ) {//iframe thumbnail
                    
                frameData.src = ui.item.find('iframe').attr('src');
                frameData.frames_original_url = ui.item.find('iframe').attr('src');
                frameData.frames_height = ui.item.height();
                    
                //sandboxed block?
                attr = ui.item.find('iframe').attr('sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('iframe').attr('data-loaderfunction');
                }
                                        
            } else {//image thumbnail
                    
                frameData.src = ui.item.find('img').attr('data-srcc');
                frameData.frames_original_url = ui.item.find('img').attr('data-srcc');
                frameData.frames_height = ui.item.find('img').attr('data-height');
                                    
                //sandboxed block?
                attr = ui.item.find('img').attr('data-sandbox');
                                
                if (typeof attr !== typeof undefined && attr !== false) {
                    this.sandbox = siteBuilderUtils.getRandomArbitrary(10000, 1000000000);
                    this.sandbox_loader = ui.item.find('img').attr('data-loaderfunction');
                }
                    
            }                
                                
            //create the new block object
            this.frameID = 0;
            this.parentLI = ui.item.get(0);
            this.parentLI.innerHTML = '';
            this.status = 'new';
            this.createFrame(frameData);
            this.parentLI.style.height = this.frameHeight+"px";
            this.createFrameCover();
                
            this.frame.addEventListener('load', this);
                
            //insert the created iframe
            ui.item.append($(this.frame));
                                           
            //add the block to the current page
            site.activePage.blocks.splice(ui.item.index(), 0, this);
                
            //custom event
            ui.item.find('iframe').trigger('canvasupdated');
                                
            //dropped element, so we've got pending changes
            site.setPendingChanges(true);
            
        };

        /*
            injects external JS (defined in config.js) into the block
        */
        this.loadJavascript = function () {

            var i,
                old,
                newScript;

            //remove old ones
            old = this.frameDocument.querySelectorAll('script.builder');

            for ( i = 0; i < old.length; i++ ) old[i].remove();

            //inject
            for ( i = 0; i < bConfig.externalJS.length; i++ ) {
                
                newScript = document.createElement('SCRIPT');
                newScript.classList.add('builder');
                newScript.src = bConfig.externalJS[i];

                this.frameDocument.querySelector('body').appendChild(newScript);
            
            }

        };  
        
    }
    
    Block.prototype.handleEvent = function(event) {
        switch (event.type) {
            case "load": 
                this.setFrameDocument();
                this.heightAdjustment();
                this.loadJavascript();
                
                $(this.frameCover).removeClass('fresh', 500);

                publisher.publish('onBlockLoaded', this);

                this.loaded = true;

                builderUI.canvasLoading('off');

                break;
                
            case "click":
                
                var theBlock = this;
                
                //figure out what to do next
                
                if( event.target.classList.contains('deleteBlock') || event.target.parentNode.classList.contains('deleteBlock') ) {//delete this block
                    
                    $(builderUI.modalDeleteBlock).modal('show');                    
                    
                    $(builderUI.modalDeleteBlock).off('click', '#deleteBlockConfirm').on('click', '#deleteBlockConfirm', function(){
                        theBlock.delete(event);
                        $(builderUI.modalDeleteBlock).modal('hide');
                    });
                    
                } else if( event.target.classList.contains('resetBlock') || event.target.parentNode.classList.contains('resetBlock') ) {//reset the block
                    
                    $(builderUI.modalResetBlock).modal('show'); 
                    
                    $(builderUI.modalResetBlock).off('click', '#resetBlockConfirm').on('click', '#resetBlockConfirm', function(){
                        theBlock.reset();
                        $(builderUI.modalResetBlock).modal('hide');
                    });
                       
                } else if( event.target.classList.contains('htmlBlock') || event.target.parentNode.classList.contains('htmlBlock') ) {//source code editor
                    
                    theBlock.source();
                    
                } else if( event.target.classList.contains('editCancelButton') || event.target.parentNode.classList.contains('editCancelButton') ) {//cancel source code editor
                    
                    theBlock.cancelSourceBlock();
                    
                } else if( event.target.classList.contains('editSaveButton') || event.target.parentNode.classList.contains('editSaveButton') ) {//save source code
                    
                    theBlock.saveSourceBlock();
                    
                } else if( event.target.classList.contains('button_clearErrorDrawer') ) {//clear error drawer
                    
                    theBlock.clearErrorDrawer();
                    
                }
                
        }
    };


    /*
        Site object literal
    */
    /*jshint -W003 */
    var site = {
        
        pendingChanges: false,      //pending changes or no?
        pages: {},                  //array containing all pages, including the child frames, loaded from the server on page load
        is_admin: 0,                //0 for non-admin, 1 for admin
        data: {},                   //container for ajax loaded site data
        pagesToDelete: [],          //contains pages to be deleted
                
        sitePages: [],              //this is the only var containing the recent canvas contents
        
        sitePagesReadyForServer: {},     //contains the site data ready to be sent to the server
        
        activePage: {},             //holds a reference to the page currently open on the canvas
        
        pageTitle: document.getElementById('pageTitle'),//holds the page title of the current page on the canvas
        
        divCanvas: document.getElementById('pageList'),//DIV containing all pages on the canvas
        
        pagesMenu: document.getElementById('pages'), //UL containing the pages menu in the sidebar
                
        buttonNewPage: document.getElementById('addPage'),
        liNewPage: document.getElementById('newPageLI'),
        
        inputPageSettingsTitle: document.getElementById('pageData_title'),
        inputPageSettingsMetaDescription: document.getElementById('pageData_metaDescription'),
        inputPageSettingsMetaKeywords: document.getElementById('pageData_metaKeywords'),
        inputPageSettingsIncludes: document.getElementById('pageData_headerIncludes'),
        inputPageSettingsPageCss: document.getElementById('pageData_headerCss'),
        
        buttonSubmitPageSettings: document.getElementById('pageSettingsSubmittButton'),
        
        modalPageSettings: document.getElementById('pageSettingsModal'),
        
        buttonSave: document.getElementById('savePage'),
        
        messageStart: document.getElementById('start'),
        divFrameWrapper: document.getElementById('frameWrapper'),
        
        skeleton: document.getElementById('skeleton'),
		
		autoSaveTimer: {},
        
        init: function() {
                        
            $.getJSON(appUI.siteUrl+"sites/siteData", function(data){
                
                if( data.site !== undefined ) {
                    site.data = data.site;
                }
                if( data.pages !== undefined ) {
                    site.pages = data.pages;
                }
                
                site.is_admin = data.is_admin;
                
				if( $('#pageList').size() > 0 ) {
                	builderUI.populateCanvas();
				}

                if( data.site.viewmode ) {
                    publisher.publish('onSetMode', data.site.viewmode);
                }
                
                //fire custom event
                $('body').trigger('siteDataLoaded');
                
            });
            
            $(this.buttonNewPage).on('click', site.newPage);
            $(this.modalPageSettings).on('show.bs.modal', site.loadPageSettings);
            $(this.buttonSubmitPageSettings).on('click', site.updatePageSettings);
            $(this.buttonSave).on('click', function(){site.save(true);});
            
            //auto save time 
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);

            publisher.subscribe('onBlockChange', function (block, type) {

                if ( block.global ) {

                    for ( var i = 0; i < site.sitePages.length; i++ ) {

                        for ( var y = 0; y < site.sitePages[i].blocks.length; y ++ ) {

                            if ( site.sitePages[i].blocks[y] !== block && site.sitePages[i].blocks[y].originalUrl === block.originalUrl && site.sitePages[i].blocks[y].global ) {

                                if ( type === 'change' ) {

                                    site.sitePages[i].blocks[y].frameDocument.body = block.frameDocument.body.cloneNode(true);

                                    publisher.publish('onBlockLoaded', site.sitePages[i].blocks[y]);

                                } else if ( type === 'reload' ) {

                                    site.sitePages[i].blocks[y].reset(false);

                                }

                            }

                        }

                    }

                }

            });
                            
        },
        
        autoSave: function(){
                                    
            if(site.pendingChanges) {
                site.save(false);
            }
			
			window.clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
        
        },
                
        setPendingChanges: function(value) {
                        
            this.pendingChanges = value;
            
            if( value === true ) {
				
				//reset timer
				window.clearInterval(this.autoSaveTimer);
            	this.autoSaveTimer = setTimeout(site.autoSave, bConfig.autoSaveTimeout);
                
                $('#savePage .bLabel').text("Save now (!)");
                
                if( site.activePage.status !== 'new' ) {
                
                    site.activePage.status = 'changed';
                    
                }
			
            } else {
	
                $('#savePage .bLabel').text("Nothing to save");
				
                site.updatePageStatus('');

            }
            
        },
                   
        save: function(showConfirmModal) {

            publisher.publish('onBeforeSave');
                                    
            //fire custom event
            $('body').trigger('beforeSave');

            //disable button
            $("a#savePage").addClass('disabled');
	
            //remove old alerts
            $('#errorModal .modal-body > *, #successModal .modal-body > *').each(function(){
                $(this).remove();
            });
	
            site.prepForSave(false);
            
            var serverData = {};
            serverData.pages = this.sitePagesReadyForServer;
            if( this.pagesToDelete.length > 0 ) {
                serverData.toDelete = this.pagesToDelete;
            }

            serverData.siteData = this.data;

            //store current responsive mode as well
            serverData.siteData.responsiveMode = builderUI.currentResponsiveMode;

            $.ajax({
                url: appUI.siteUrl+"sites/save",
                type: "POST",
                dataType: "json",
                data: serverData,
            }).done(function(res){
	
                //enable button
                $("a#savePage").removeClass('disabled');
	
                if( res.responseCode === 0 ) {
			
                    if( showConfirmModal ) {
				
                        $('#errorModal .modal-body').append( $(res.responseHTML) );
                        $('#errorModal').modal('show');
				
                    }
		
                } else if( res.responseCode === 1 ) {
		
                    if( showConfirmModal ) {
		
                        $('#successModal .modal-body').append( $(res.responseHTML) );
                        $('#successModal').modal('show');
				
                    }
			
			
                    //no more pending changes
                    site.setPendingChanges(false);
			

                    //update revisions?
                    $('body').trigger('changePage');
                
                }
            });
    
        },
        
        /*
            preps the site data before sending it to the server
        */
        prepForSave: function(template) {
            
            this.sitePagesReadyForServer = {};
            
            if( template ) {//saving template, only the activePage is needed
                
                this.sitePagesReadyForServer[this.activePage.name] = this.activePage.prepForSave();
                
                this.activePage.fullPage();
                
            } else {//regular save
            
                //find the pages which need to be send to the server
                for( var i = 0; i < this.sitePages.length; i++ ) {
                                
                    if( this.sitePages[i].status !== '' ) {
                                    
                        this.sitePagesReadyForServer[this.sitePages[i].name] = this.sitePages[i].prepForSave();
                    
                    }
                
                }
            
            }
                                                                            
        },
        
        
        /*
            sets a page as the active one
        */
        setActive: function(page) {
            
            //reference to the active page
            this.activePage = page;
            
            //hide other pages
            for(var i in this.sitePages) {
                this.sitePages[i].parentUL.style.display = 'none';   
            }
            
            //display active one
            this.activePage.parentUL.style.display = 'block';
            
        },
        
        
        /*
            de-active all page menu items
        */
        deActivateAll: function() {
            
            var pages = this.pagesMenu.querySelectorAll('li');
            
            for( var i = 0; i < pages.length; i++ ) {
                pages[i].classList.remove('active');
            }
            
        },
        
        
        /*
            adds a new page to the site
        */
        newPage: function() {
            
            site.deActivateAll();
            
            //create the new page instance
            
            var pageData = [];
            var temp = {
                pages_id: 0
            };
            pageData[0] = temp;
            
            var newPageName = 'page'+(site.sitePages.length+1);
            
            var newPage = new Page(newPageName, pageData, site.sitePages.length+1);
            
            newPage.status = 'new';
            
            newPage.selectPage();
            newPage.editPageName();
        
            newPage.isEmpty();
                        
            site.setPendingChanges(true);
                                    
        },
        
        
        /*
            checks if the name of a page is allowed
        */
        checkPageName: function(pageName) {
            
            //make sure the name is unique
            for( var i in this.sitePages ) {
                
                if( this.sitePages[i].name === pageName && this.activePage !== this.sitePages[i] ) {
                    this.pageNameError = "The page name must be unique.";
                    return false;
                }   
                
            }
            
            return true;
            
        },
        
        
        /*
            removes unallowed characters from the page name
        */
        prepPageName: function(pageName) {
            
            pageName = pageName.replace(' ', '');
            pageName = pageName.replace(/[?*!.|&#;$%@"<>()+,]/g, "");
            
            return pageName;
            
        },
        
        
        /*
            save page settings for the current page
        */
        updatePageSettings: function() {
            
            site.activePage.pageSettings.title = site.inputPageSettingsTitle.value;
            site.activePage.pageSettings.meta_description = site.inputPageSettingsMetaDescription.value;
            site.activePage.pageSettings.meta_keywords = site.inputPageSettingsMetaKeywords.value;
            site.activePage.pageSettings.header_includes = site.inputPageSettingsIncludes.value;
            site.activePage.pageSettings.page_css = site.inputPageSettingsPageCss.value;
                        
            site.setPendingChanges(true);
            
            $(site.modalPageSettings).modal('hide');
            
        },
        
        
        /*
            update page statuses
        */
        updatePageStatus: function(status) {
            
            for( var i in this.sitePages ) {
                this.sitePages[i].status = status;   
            }
            
        },


        /*
            Checks all the blocks in this site have finished loading
        */
        loaded: function () {

            var i;

            for ( i = 0; i < this.sitePages.length; i++ ) {

                if ( !this.sitePages[i].loaded() ) return false;

            }

            return true;

        },


        /*
            Make every block have an overlay during dragging to prevent mouse event issues
        */
        moveMode: function (value) {

            var i;

            for ( i = 0; i < this.activePage.blocks.length; i++ ) {

                if ( value === 'on' ) this.activePage.blocks[i].frameCover.classList.add('move');
                else if ( value === 'off' ) this.activePage.blocks[i].frameCover.classList.remove('move');

            }

        }
    
    };

    builderUI.init(); site.init();

    
    //**** EXPORTS
    module.exports.site = site;
    module.exports.builderUI = builderUI;

}());
},{"../vendor/publisher":10,"./config.js":3,"./ui.js":7,"./utils.js":8}],3:[function(require,module,exports){
(function () {
	"use strict";
        
    module.exports.pageContainer = "#page";
    
    module.exports.editableItems = {
        'span.fa': ['color', 'font-size'],
        '.bg.bg1': ['background-color'],
        'nav a': ['color', 'font-weight', 'text-transform'],
        'img': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-color', 'border-style', 'border-width'],
        'hr.dashed': ['border-color', 'border-width'],
        '.divider > span': ['color', 'font-size'],
        'hr.shadowDown': ['margin-top', 'margin-bottom'],
        '.footer a': ['color'],
        '.social a': ['color'],
        '.bg.bg1, .bg.bg2, .header10, .header11': ['background-image', 'background-color'],
        '.frameCover': [],
        '.editContent': ['content', 'color', 'font-size', 'background-color', 'font-family'],
        'a.btn, button.btn': ['border-radius', 'font-size', 'background-color'],
        '#pricing_table2 .pricing2 .bottom li': ['content']
    };
    
    module.exports.editableItemOptions = {
        'nav a : font-weight': ['400', '700'],
        'a.btn : border-radius': ['0px', '4px', '10px'],
        'img : border-style': ['none', 'dotted', 'dashed', 'solid'],
        'img : border-width': ['1px', '2px', '3px', '4px'],
        'h1, h2, h3, h4, h5, p : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'h2 : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'h3 : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman'],
        'p : font-family': ['default', 'Lato', 'Helvetica', 'Arial', 'Times New Roman']
    };

    module.exports.responsiveModes = {
        desktop: '97%',
        mobile: '480px',
        tablet: '1024px'
    };

    module.exports.editableContent = ['.editContent', '.navbar a', 'button', 'a.btn', '.footer a:not(.fa)', '.tableWrapper', 'h1', 'h2'];

    module.exports.autoSaveTimeout = 300000;
    
    module.exports.sourceCodeEditSyntaxDelay = 10000;

    module.exports.mediumCssUrls = [
        '//cdn.jsdelivr.net/medium-editor/latest/css/medium-editor.min.css',
        '/css/medium-bootstrap.css'
    ];
    module.exports.mediumButtons = ['bold', 'italic', 'underline', 'anchor', 'orderedlist', 'unorderedlist', 'h1', 'h2', 'h3', 'h4', 'removeFormat'];

    module.exports.externalJS = [
        'js/builder_in_block.js'
    ];
                    
}());
},{}],4:[function(require,module,exports){
(function () {
	"use strict";

	var bConfig = require('./config.js');
	var siteBuilder = require('./builder.js');
	var appUI = require('./ui.js').appUI;

	var publish = {
        
        buttonPublish: document.getElementById('publishPage'),
        buttonSavePendingBeforePublishing: document.getElementById('buttonSavePendingBeforePublishing'),
        publishModal: document.getElementById('publishModal'),
        buttonPublishSubmit: document.getElementById('publishSubmit'),
        publishActive: 0,
        theItem: {},
        modalSiteSettings: document.getElementById('siteSettings'),
    
        init: function() {
        
            $(this.buttonPublish).on('click', this.loadPublishModal);
            $(this.buttonSavePendingBeforePublishing).on('click', this.saveBeforePublishing);
            $(this.publishModal).on('change', 'input[type=checkbox]', this.publishCheckboxEvent);
            $(this.buttonPublishSubmit).on('click', this.publishSite);
            $(this.modalSiteSettings).on('click', '#siteSettingsBrowseFTPButton, .link', this.browseFTP);
            $(this.modalSiteSettings).on('click', '#ftpListItems .close', this.closeFtpBrowser);
            $(this.modalSiteSettings).on('click', '#siteSettingsTestFTP', this.testFTPConnection);
            
            //show the publish button
            $(this.buttonPublish).show();
            
            //listen to site settings load event
            $('body').on('siteSettingsLoad', this.showPublishSettings);
            
            //publish hash?
            if( window.location.hash === "#publish" ) {
                $(this.buttonPublish).click();
            }
            
            // header tooltips
            //if( this.buttonPublish.hasAttribute('data-toggle') && this.buttonPublish.getAttribute('data-toggle') == 'tooltip' ) {
            //   $(this.buttonPublish).tooltip('show');
            //   setTimeout(function(){$(this.buttonPublish).tooltip('hide')}, 5000);
            //}
            
        },
        
        
        /*
            loads the publish modal
        */
        loadPublishModal: function(e) {
            
            e.preventDefault();
            
            if( publish.publishActive === 0 ) {//check if we're currently publishing anything
		
                //hide alerts
                $('#publishModal .modal-alerts > *').each(function(){
                    $(this).remove();
                });
                
                $('#publishModal .modal-body > .alert-success').hide();
                
                //hide loaders
                $('#publishModal_assets .publishing').each(function(){
                    $(this).hide();
                    $(this).find('.working').show();
                    $(this).find('.done').hide();
                });
                
                //remove published class from asset checkboxes
                $('#publishModal_assets input').each(function(){
                    $(this).removeClass('published');
                });
                
                //do we have pending changes?
                if( siteBuilder.site.pendingChanges === true ) {//we've got changes, save first
                    
                    $('#publishModal #publishPendingChangesMessage').show();
                    $('#publishModal .modal-body-content').hide();
		
                } else {//all set, get on it with publishing
                    
                    //get the correct pages in the Pages section of the publish modal
                    $('#publishModal_pages tbody > *').remove();

                    $('#pages li:visible').each(function(){
                        
                        var thePage = $(this).find('a:first').text();
                        var theRow = $('<tr><td class="text-center" style="width: 30px;"><label class="checkbox no-label"><input type="checkbox" value="'+thePage+'" id="" data-type="page" name="pages[]" data-toggle="checkbox"></label></td><td>'+thePage+'<span class="publishing"><span class="working">Publishing... <img src="'+appUI.baseUrl+'images/publishLoader.gif"></span><span class="done text-primary">Published &nbsp;<span class="fui-check"></span></span></span></td></tr>');
                        
                        //checkboxify
                        theRow.find('input').radiocheck();
                        theRow.find('input').on('check uncheck toggle', function(){
                            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected-row');
                        });
                        
                        $('#publishModal_pages tbody').append( theRow );
                    
                    });
                    
                    $('#publishModal #publishPendingChangesMessage').hide();
                    $('#publishModal .modal-body-content').show();
                
                }
            }
            
            //enable/disable publish button
            
            var activateButton = false;
            
            $('#publishModal input[type=checkbox]').each(function(){
			
                if( $(this).prop('checked') ) {
                    activateButton = true;
                    return false;
                }
            });
            
            if( activateButton ) {
                $('#publishSubmit').removeClass('disabled');
            } else {
                $('#publishSubmit').addClass('disabled');
            }
            
            $('#publishModal').modal('show');
            
        },
        
        
        /*
            saves pending changes before publishing
        */
        saveBeforePublishing: function() {
            
            $('#publishModal #publishPendingChangesMessage').hide();
            $('#publishModal .loader').show();
            $(this).addClass('disabled');

            siteBuilder.site.prepForSave(false);
            
            var serverData = {};
            serverData.pages = siteBuilder.site.sitePagesReadyForServer;
            if( siteBuilder.site.pagesToDelete.length > 0 ) {
                serverData.toDelete = siteBuilder.site.pagesToDelete;
            }
            serverData.siteData = siteBuilder.site.data;
            
            $.ajax({
                url: appUI.siteUrl+"sites/save/1",
                type: "POST",
                dataType: "json",
                data: serverData,
            }).done(function(res){			
						
                $('#publishModal .loader').fadeOut(500, function(){
                    
                    $('#publishModal .modal-alerts').append( $(res.responseHTML) );
                    
                    //self-destruct success messages
                    setTimeout(function(){$('#publishModal .modal-alerts .alert-success').fadeOut(500, function(){$(this).remove();});}, 2500);
                    
                    //enable button
                    $('#publishModal #publishPendingChangesMessage .btn.save').removeClass('disabled');
                
                });
				
                if( res.responseCode === 1 ) {//changes were saved without issues

                    //no more pending changes
                    siteBuilder.site.setPendingChanges(false);
				
                    //get the correct pages in the Pages section of the publish modal
                    $('#publishModal_pages tbody > *').remove();

                    $('#pages li:visible').each(function(){
				
                        var thePage = $(this).find('a:first').text();
                        var theRow = $('<tr><td class="text-center" style="width: 0px;"><label class="checkbox"><input type="checkbox" value="'+thePage+'" id="" data-type="page" name="pages[]" data-toggle="checkbox"></label></td><td>'+thePage+'<span class="publishing"><span class="working">Publishing... <img src="'+appUI.baseUrl+'images/publishLoader.gif"></span><span class="done text-primary">Published &nbsp;<span class="fui-check"></span></span></span></td></tr>');
                        
                        //checkboxify
                        theRow.find('input').radiocheck();
                        theRow.find('input').on('check uncheck toggle', function(){
                            $(this).closest('tr')[$(this).prop('checked') ? 'addClass' : 'removeClass']('selected-row');
                        });
                        
                        $('#publishModal_pages tbody').append( theRow );
                    
                    });
                    
                    //show content
                    $('#publishModal .modal-body-content').fadeIn(500);
                
                }
            
            });
            
        },
        
        
        /*
            event handler for the checkboxes inside the publish modal
        */
        publishCheckboxEvent: function() {
            
            var activateButton = false;
            
            $('#publishModal input[type=checkbox]').each(function(){
                
                if( $(this).prop('checked') ) {
                    activateButton = true;
                    return false;
                }
            
            });
            
            if( activateButton ) {
                
                $('#publishSubmit').removeClass('disabled');
            
            } else {
                
                $('#publishSubmit').addClass('disabled');
            
            }
            
        },
        
        
        /*
            publishes the selected items
        */
        publishSite: function() {
            
            //track the publishing state
            publish.publishActive = 1;
            
            //disable button
            $('#publishSubmit, #publishCancel').addClass('disabled');
		
            //remove existing alerts
            $('#publishModal .modal-alerts > *').remove();
		
            //prepare stuff
            $('#publishModal form input[type="hidden"].page').remove();
            
            //loop through all pages
            $('#pageList > ul').each(function(){
                
                //export this page?
                if( $('#publishModal #publishModal_pages input:eq('+($(this).index()+1)+')').prop('checked') ) {
                    
                    //grab the skeleton markup
                    var newDocMainParent = $('iframe#skeleton').contents().find( bConfig.pageContainer );
                    
                    //empty out the skeleton
                    newDocMainParent.find('*').remove();
                    
                    //loop through page iframes and grab the body stuff
                    $(this).find('iframe').each(function(){
                        
                        var attr = $(this).attr('data-sandbox');

                        var theContents;
                        
                        if (typeof attr !== typeof undefined && attr !== false) {
                            theContents = $('#sandboxes #'+attr).contents().find( bConfig.pageContainer );
                        } else {
                            theContents = $(this).contents().find( bConfig.pageContainer );
                        }
                        
                        theContents.find('.frameCover').each(function(){
                            $(this).remove();
                        });
                        
                        //remove inline styling leftovers
                        for( var key in bConfig.editableItems ) {
                            
                            theContents.find( key ).each(function(){
                                
                                $(this).removeAttr('data-selector');
                                
                                if( $(this).attr('style') === '' ) {
                                    $(this).removeAttr('style');
                                }
                            
                            });
                        
                        }	
					
                        for (var i = 0; i < bConfig.editableContent.length; ++i) {
                            
                            $(this).contents().find( bConfig.editableContent[i] ).each(function(){
                                $(this).removeAttr('data-selector');
                            });
                        
                        }
                        
                        var toAdd = theContents.html();
                        
                        //grab scripts
                        
                        var scripts = $(this).contents().find( bConfig.pageContainer ).find('script');
                        
                        if( scripts.size() > 0 ) {
                            
                            var theIframe = document.getElementById("skeleton");
                            
                            scripts.each(function(){

                                var script;
                                
                                if( $(this).text() !== '' ) {//script tags with content
                                    
                                    script = theIframe.contentWindow.document.createElement("script");
                                    script.type = 'text/javascript';
                                    script.innerHTML = $(this).text();
                                    theIframe.contentWindow.document.getElementById( bConfig.pageContainer.substring(1) ).appendChild(script);
                                
                                } else if( $(this).attr('src') !== null ) {
                                    
                                    script = theIframe.contentWindow.document.createElement("script");
                                    script.type = 'text/javascript';
                                    script.src = $(this).attr('src');
                                    theIframe.contentWindow.document.getElementById( bConfig.pageContainer.substring(1) ).appendChild(script);
                                }
                            
                            });
                        
                        }
                        
                        newDocMainParent.append( $(toAdd) );
                    
                    });
                    
                    var newInput = $('<input type="hidden" class="page" name="xpages['+$('#pages li:eq('+($(this).index()+1)+') a:first').text()+']" value="">');
                    
                    $('#publishModal form').prepend( newInput );
                    
                    newInput.val( "<html>"+$('iframe#skeleton').contents().find('html').html()+"</html>" );
                
                }
            
            });
            
            publish.publishAsset();
            
        },
        
        publishAsset: function() {
            
            var toPublish = $('#publishModal_assets input[type=checkbox]:checked:not(.published, .toggleAll), #publishModal_pages input[type=checkbox]:checked:not(.published, .toggleAll)');
            
            if( toPublish.size() > 0 ) {
                
                publish.theItem = toPublish.first();
                
                //display the asset loader
                publish.theItem.closest('td').next().find('.publishing').fadeIn(500);

                var theData;
		
                if( publish.theItem.attr('data-type') === 'page' ) {
                    
                    theData = {siteID: $('form#publishForm input[name=siteID]').val(), item: publish.theItem.val(), pageContent: $('form#publishForm input[name="xpages['+publish.theItem.val()+']"]').val()};
                
                } else if( publish.theItem.attr('data-type') === 'asset' ) {
                    
                    theData = {siteID: $('form#publishForm input[name=siteID]').val(), item: publish.theItem.val()};
                
                }
                
                $.ajax({
                    url: $('form#publishForm').attr('action')+"/"+publish.theItem.attr('data-type'),
                    type: 'post',
                    data: theData,
                    dataType: 'json'
                }).done(function(ret){
                    
                    if( ret.responseCode === 0 ) {//fatal error, publishing will stop
                        
                        //hide indicators
                        publish.theItem.closest('td').next().find('.working').hide();
                        
                        //enable buttons
                        $('#publishSubmit, #publishCancel').removeClass('disabled');
                        $('#publishModal .modal-alerts').append( $(ret.responseHTML) );
                    
                    } else if( ret.responseCode === 1 ) {//no issues
                        
                        //show done
                        publish.theItem.closest('td').next().find('.working').hide();
                        publish.theItem.closest('td').next().find('.done').fadeIn();
                        publish.theItem.addClass('published');
                        
                        publish.publishAsset();
                    
                    }
                
                });

            } else {
                
                //publishing is done
                publish.publishActive = 0;
                
                //enable buttons
                $('#publishSubmit, #publishCancel').removeClass('disabled');
		
                //show message
                $('#publishModal .modal-body > .alert-success').fadeIn(500, function(){
                    setTimeout(function(){$('#publishModal .modal-body > .alert-success').fadeOut(500);}, 2500);
                });
            
            }
            
        },
        
        showPublishSettings: function() {
                        
            $('#siteSettingsPublishing').show();
        },
        
        
        /*
            browse the FTP connection
        */
        browseFTP: function(e) {
            
            e.preventDefault();
    		
    		//got all we need?
    		
    		if( $('#siteSettings_ftpServer').val() === '' || $('#siteSettings_ftpUser').val() === '' || $('#siteSettings_ftpPassword').val() === '' ) {
                alert('Please make sure all FTP connection details are present');
                return false;
            }
    		
            //check if this is a deeper level link
    		if( $(this).hasClass('link') ) {
    			
    			if( $(this).hasClass('back') ) {
    			
    				$('#siteSettings_ftpPath').val( $(this).attr('href') );
    			
    			} else {
    			
    				//if so, we'll change the path before connecting
    			
    				if( $('#siteSettings_ftpPath').val().substr( $('#siteSettings_ftpPath').val.length - 1 ) === '/' ) {//prepend "/"
    				
    					$('#siteSettings_ftpPath').val( $('#siteSettings_ftpPath').val()+$(this).attr('href') );
    			
    				} else {
    				
    					$('#siteSettings_ftpPath').val( $('#siteSettings_ftpPath').val()+"/"+$(this).attr('href') );
    				
    				}
    			
    			}
    			
    			
    		}
    		
    		//destroy all alerts
    		
    		$('#ftpAlerts .alert').fadeOut(500, function(){
    			$(this).remove();
    		});
    		
    		//disable button
    		$(this).addClass('disabled');
    		
    		//remove existing links
    		$('#ftpListItems > *').remove();
    		
    		//show ftp section
    		$('#ftpBrowse .loaderFtp').show();
    		$('#ftpBrowse').slideDown(500);

    		var theButton = $(this);
    		
    		$.ajax({
                url: appUI.siteUrl+"ftpconnection/connect",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		
    			//enable button
    			theButton.removeClass('disabled');
    			
    			//hide loading
    			$('#ftpBrowse .loaderFtp').hide();
    		
    			if( ret.responseCode === 0 ) {//error
    				$('#ftpAlerts').append( $(ret.responseHTML) );
    			} else if( ret.responseCode === 1 ) {//all good
    				$('#ftpListItems').append( $(ret.responseHTML) );
    			}
    		
    		});
            
        },
        
        
        /*
            hides/closes the FTP browser
        */
        closeFtpBrowser: function(e) {
            
            e.preventDefault();
    		$(this).closest('#ftpBrowse').slideUp(500);
            
        },
        
        
         /*
            tests the FTP connection with the provided details
        */
        testFTPConnection: function() {
            
            //got all we need?
    		if( $('#siteSettings_ftpServer').val() === '' || $('#siteSettings_ftpUser').val() === '' || $('#siteSettings_ftpPassword').val() === '' ) {
                alert('Please make sure all FTP connection details are present');
                return false;
            }
    		
    		//destroy all alerts
            $('#ftpTestAlerts .alert').fadeOut(500, function(){
                $(this).remove();
            });
    		
    		//disable button
    		$(this).addClass('disabled');
    		
    		//show loading indicator
    		$(this).next().fadeIn(500);
    		
            var theButton = $(this);
    		
    		$.ajax({
                url: appUI.siteUrl+"ftpconnection/test",
    			type: 'post',
    			dataType: 'json',
    			data: $('form#siteSettingsForm').serializeArray()
    		}).done(function(ret){
    		    		
    			//enable button
    			theButton.removeClass('disabled');
                theButton.next().fadeOut(500);
    			    		
    			if( ret.responseCode === 0 ) {//error
                    $('#ftpTestAlerts').append( $(ret.responseHTML) );
                } else if( ret.responseCode === 1 ) {//all good
                    $('#ftpTestAlerts').append( $(ret.responseHTML) );
                }
    		
    		});
            
        }
        
    };
    
    publish.init();

}());
},{"./builder.js":2,"./config.js":3,"./ui.js":7}],5:[function(require,module,exports){
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
},{"./ui.js":7}],6:[function(require,module,exports){
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
},{"./ui.js":7}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
(function () {
    "use strict";
    
    exports.getRandomArbitrary = function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    exports.getParameterByName = function (name, url) {

        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
        
    };
    
}());
},{}],9:[function(require,module,exports){
(function () {
	"use strict";

	require('./modules/ui.js');
	require('./modules/account.js');
	require('./modules/sites.js');
	require('./modules/sitesettings.js');
	require('./modules/publishing.js');

}());
},{"./modules/account.js":1,"./modules/publishing.js":4,"./modules/sites.js":5,"./modules/sitesettings.js":6,"./modules/ui.js":7}],10:[function(require,module,exports){
/*!
 * publisher.js - (c) Ryan Florence 2011
 * github.com/rpflorence/publisher.js
 * MIT License
*/

// UMD Boilerplate \o/ && D:
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(); // node
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // amd
  } else {
    // window with noConflict
    var _publisher = root.publisher;
    var publisher = root.publisher = factory();
    root.publisher.noConflict = function () {
      root.publisher = _publisher;
      return publisher;
    }
  }
}(this, function () {

  var publisher = function (obj) {
    var topics = {};
    obj = obj || {};

    obj.publish = function (topic/*, messages...*/) {
      if (!topics[topic]) return obj;
      var messages = [].slice.call(arguments, 1);
      for (var i = 0, l = topics[topic].length; i < l; i++) {
        topics[topic][i].handler.apply(topics[topic][i].context, messages);
      }
      return obj;
    };

    obj.subscribe = function (topicOrSubscriber, handlerOrTopics) {
      var firstType = typeof topicOrSubscriber;

      if (firstType === 'string') {
        return subscribe.apply(null, arguments);
      }

      if (firstType === 'object' && !handlerOrTopics) {
        return subscribeMultiple.apply(null, arguments);
      }

      if (typeof handlerOrTopics === 'string') {
        return hitch.apply(null, arguments);
      }

      return hitchMultiple.apply(null, arguments);
    };

    function subscribe (topic, handler, context) {
      var reference = { handler: handler, context: context || obj };
      topic = topics[topic] || (topics[topic] = []);
      topic.push(reference);
      return {
        attach: function () {
          topic.push(reference);
          return this;
        },
        detach: function () {
          erase(topic, reference);
          return this;
        }
      };
    };

    function subscribeMultiple (pairs) {
      var subscriptions = {};
      for (var topic in pairs) {
        if (!pairs.hasOwnProperty(topic)) continue;
        subscriptions[topic] = subscribe(topic, pairs[topic]);
      }
      return subscriptions;
    };

    function hitch (subscriber, topic) {
      return subscribe(topic, subscriber[topic], subscriber);
    };

    function hitchMultiple (subscriber, topics) {
      var subscriptions = [];
      for (var i = 0, l = topics.length; i < l; i++) {
        subscriptions.push( hitch(subscriber, topics[i]) );
      }
      return subscriptions;
    };

    function erase (arr, victim) {
      for (var i = 0, l = arr.length; i < l; i++){
        if (arr[i] === victim) arr.splice(i, 1);
      }
    }

    return obj;
  };

  // publisher is a publisher, so meta ...
  return publisher(publisher);
}));

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9tb2R1bGVzL2FjY291bnQuanMiLCJqcy9tb2R1bGVzL2J1aWxkZXIuanMiLCJqcy9tb2R1bGVzL2NvbmZpZy5qcyIsImpzL21vZHVsZXMvcHVibGlzaGluZy5qcyIsImpzL21vZHVsZXMvc2l0ZXMuanMiLCJqcy9tb2R1bGVzL3NpdGVzZXR0aW5ncy5qcyIsImpzL21vZHVsZXMvdWkuanMiLCJqcy9tb2R1bGVzL3V0aWxzLmpzIiwianMvc2l0ZXMuanMiLCJqcy92ZW5kb3IvcHVibGlzaGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNytEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cblx0dmFyIGFjY291bnQgPSB7XG4gICAgICAgIFxuICAgICAgICBidXR0b25VcGRhdGVBY2NvdW50RGV0YWlsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY291bnREZXRhaWxzU3VibWl0JyksXG4gICAgICAgIGJ1dHRvblVwZGF0ZUxvZ2luRGV0YWlsczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY291bnRMb2dpblN1Ym1pdCcpLFxuICAgICAgICBcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25VcGRhdGVBY2NvdW50RGV0YWlscykub24oJ2NsaWNrJywgdGhpcy51cGRhdGVBY2NvdW50RGV0YWlscyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uVXBkYXRlTG9naW5EZXRhaWxzKS5vbignY2xpY2snLCB0aGlzLnVwZGF0ZUxvZ2luRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlcyBhY2NvdW50IGRldGFpbHNcbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlQWNjb3VudERldGFpbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FsbCBmaWVsZHMgZmlsbGVkIGluP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykuYWRkQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2ZpcnN0bmFtZScpLmNsb3Nlc3QoJy5mb3JtLWdyb3VwJykucmVtb3ZlQ2xhc3MoJ2hhcy1lcnJvcicpO1xuICAgICAgICAgICAgICAgIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfZGV0YWlscyBpbnB1dCNsYXN0bmFtZScpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9kZXRhaWxzIGlucHV0I2xhc3RuYW1lJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgaW5wdXQjbGFzdG5hbWUnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cblx0XHRcbiAgICAgICAgICAgIGlmKCBhbGxHb29kID09PSAxICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHRoZUJ1dHRvbiA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmxvYWRlcicpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIGFsZXJ0c1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmFsZXJ0cyA+IConKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJ1c2Vycy91YWNjb3VudFwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICQoJyNhY2NvdW50X2RldGFpbHMnKS5zZXJpYWxpemUoKVxuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0aGVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2hpZGUgbG9hZGVyXG4gICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2RldGFpbHMgLmxvYWRlcicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyAuYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9zdWNjZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2FjY291bnRfZGV0YWlscyAuYWxlcnRzID4gKicpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbiAoKSB7ICQodGhpcykucmVtb3ZlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZXMgYWNjb3VudCBsb2dpbiBkZXRhaWxzXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZUxvZ2luRGV0YWlsczogZnVuY3Rpb24oKSB7XG5cdFx0XHRcblx0XHRcdGNvbnNvbGUubG9nKGFwcFVJKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGFsbEdvb2QgPSAxO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS52YWwoKSA9PT0gJycgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI2FjY291bnRfbG9naW4gaW5wdXQjZW1haWwnKS5jbG9zZXN0KCcuZm9ybS1ncm91cCcpLnJlbW92ZUNsYXNzKCdoYXMtZXJyb3InKTtcbiAgICAgICAgICAgICAgICBhbGxHb29kID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5hZGRDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIGlucHV0I3Bhc3N3b3JkJykuY2xvc2VzdCgnLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnaGFzLWVycm9yJyk7XG4gICAgICAgICAgICAgICAgYWxsR29vZCA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBhbGxHb29kID09PSAxICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVCdXR0b24gPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zaG93IGxvYWRlclxuICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIC5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBhbGVydHNcbiAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzID4gKicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInVzZXJzL3Vsb2dpblwiLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6ICQoJyNhY2NvdW50X2xvZ2luJykuc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdGhlQnV0dG9uLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9oaWRlIGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAubG9hZGVyJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjYWNjb3VudF9sb2dpbiAuYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG5cdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAxICkgey8vc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNhY2NvdW50X2xvZ2luIC5hbGVydHMgPiAqJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uICgpIHsgJCh0aGlzKS5yZW1vdmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9O1xuICAgIFxuICAgIGFjY291bnQuaW5pdCgpO1xuXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIHNpdGVCdWlsZGVyVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG4gICAgdmFyIGJDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xuICAgIHZhciBhcHBVSSA9IHJlcXVpcmUoJy4vdWkuanMnKS5hcHBVSTtcbiAgICB2YXIgcHVibGlzaGVyID0gcmVxdWlyZSgnLi4vdmVuZG9yL3B1Ymxpc2hlcicpO1xuXG5cblx0IC8qXG4gICAgICAgIEJhc2ljIEJ1aWxkZXIgVUkgaW5pdGlhbGlzYXRpb25cbiAgICAqL1xuICAgIHZhciBidWlsZGVyVUkgPSB7XG4gICAgICAgIFxuICAgICAgICBhbGxCbG9ja3M6IHt9LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2hvbGRzIGFsbCBibG9ja3MgbG9hZGVkIGZyb20gdGhlIHNlcnZlclxuICAgICAgICBtZW51V3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbnUnKSxcbiAgICAgICAgcHJpbWFyeVNpZGVNZW51V3JhcHBlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4nKSxcbiAgICAgICAgYnV0dG9uQmFjazogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tCdXR0b24nKSxcbiAgICAgICAgYnV0dG9uQmFja0NvbmZpcm06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWF2ZVBhZ2VCdXR0b24nKSxcbiAgICAgICAgXG4gICAgICAgIGFjZUVkaXRvcnM6IHt9LFxuICAgICAgICBmcmFtZUNvbnRlbnRzOiAnJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vaG9sZHMgZnJhbWUgY29udGVudHNcbiAgICAgICAgdGVtcGxhdGVJRDogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2hvbGRzIHRoZSB0ZW1wbGF0ZSBJRCBmb3IgYSBwYWdlICg/Pz8pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG1vZGFsRGVsZXRlQmxvY2s6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVCbG9jaycpLFxuICAgICAgICBtb2RhbFJlc2V0QmxvY2s6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldEJsb2NrJyksXG4gICAgICAgIG1vZGFsRGVsZXRlUGFnZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbGV0ZVBhZ2UnKSxcbiAgICAgICAgYnV0dG9uRGVsZXRlUGFnZUNvbmZpcm06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVQYWdlQ29uZmlybScpLFxuICAgICAgICBcbiAgICAgICAgZHJvcGRvd25QYWdlTGlua3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnRlcm5hbExpbmtzRHJvcGRvd24nKSxcblxuICAgICAgICBwYWdlSW5Vcmw6IG51bGwsXG4gICAgICAgIFxuICAgICAgICB0ZW1wRnJhbWU6IHt9LFxuXG4gICAgICAgIGN1cnJlbnRSZXNwb25zaXZlTW9kZToge30sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbG9hZCBibG9ja3NcbiAgICAgICAgICAgICQuZ2V0SlNPTihhcHBVSS5iYXNlVXJsKydlbGVtZW50cy5qc29uP3Y9MTIzNDU2NzgnLCBmdW5jdGlvbihkYXRhKXsgYnVpbGRlclVJLmFsbEJsb2NrcyA9IGRhdGE7IGJ1aWxkZXJVSS5pbXBsZW1lbnRCbG9ja3MoKTsgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2l0ZWJhciBob3ZlciBhbmltYXRpb24gYWN0aW9uXG4gICAgICAgICAgICAkKHRoaXMubWVudVdyYXBwZXIpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnN0b3AoKS5hbmltYXRlKHsnbGVmdCc6ICcwcHgnfSwgNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnN0b3AoKS5hbmltYXRlKHsnbGVmdCc6ICctMTkwcHgnfSwgNTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjbWVudSAjbWFpbiBhJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICQoJy5tZW51IC5zZWNvbmQnKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgfSwgNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAkKCcjbWVudSAjc2Vjb25kJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcHJldmVudCBjbGljayBldmVudCBvbiBhbmNvcnMgaW4gdGhlIGJsb2NrIHNlY3Rpb24gb2YgdGhlIHNpZGViYXJcbiAgICAgICAgICAgICQodGhpcy5wcmltYXJ5U2lkZU1lbnVXcmFwcGVyKS5vbignY2xpY2snLCAnYTpub3QoLmFjdGlvbkJ1dHRvbnMpJywgZnVuY3Rpb24oZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO30pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uQmFjaykub24oJ2NsaWNrJywgdGhpcy5iYWNrQnV0dG9uKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25CYWNrQ29uZmlybSkub24oJ2NsaWNrJywgdGhpcy5iYWNrQnV0dG9uQ29uZmlybSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbm90aWZ5IHRoZSB1c2VyIG9mIHBlbmRpbmcgY2huYWdlcyB3aGVuIGNsaWNraW5nIHRoZSBiYWNrIGJ1dHRvblxuICAgICAgICAgICAgJCh3aW5kb3cpLmJpbmQoJ2JlZm9yZXVubG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgaWYoIHNpdGUucGVuZGluZ0NoYW5nZXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnWW91ciBzaXRlIGNvbnRhaW5zIGNoYW5nZWQgd2hpY2ggaGF2ZW5cXCd0IGJlZW4gc2F2ZWQgeWV0LiBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9VUkwgcGFyYW1ldGVyc1xuICAgICAgICAgICAgYnVpbGRlclVJLnBhZ2VJblVybCA9IHNpdGVCdWlsZGVyVXRpbHMuZ2V0UGFyYW1ldGVyQnlOYW1lKCdwJyk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgYnVpbGRzIHRoZSBibG9ja3MgaW50byB0aGUgc2l0ZSBiYXJcbiAgICAgICAgKi9cbiAgICAgICAgaW1wbGVtZW50QmxvY2tzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIG5ld0l0ZW0sIGxvYWRlckZ1bmN0aW9uO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBrZXkgaW4gdGhpcy5hbGxCbG9ja3MuZWxlbWVudHMgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIG5pY2VLZXkgPSBrZXkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKFwiIFwiLCBcIl9cIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnPGxpPjxhIGhyZWY9XCJcIiBpZD1cIicrbmljZUtleSsnXCI+JytrZXkrJzwvYT48L2xpPicpLmFwcGVuZFRvKCcjbWVudSAjbWFpbiB1bCNlbGVtZW50Q2F0cycpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciggdmFyIHggPSAwOyB4IDwgdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XS5sZW5ndGg7IHgrKyApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLnRodW1ibmFpbCA9PT0gbnVsbCApIHsvL3dlJ2xsIG5lZWQgYW4gaWZyYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYnVpbGQgdXMgc29tZSBpZnJhbWVzIVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5zYW5kYm94ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmxvYWRlckZ1bmN0aW9uICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJGdW5jdGlvbiA9ICdkYXRhLWxvYWRlcmZ1bmN0aW9uPVwiJyt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmxvYWRlckZ1bmN0aW9uKydcIic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0gPSAkKCc8bGkgY2xhc3M9XCJlbGVtZW50ICcrbmljZUtleSsnXCI+PGlmcmFtZSBzcmM9XCInK2FwcFVJLmJhc2VVcmwrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS51cmwrJ1wiIHNjcm9sbGluZz1cIm5vXCIgc2FuZGJveD1cImFsbG93LXNhbWUtb3JpZ2luXCI+PC9pZnJhbWU+PC9saT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtID0gJCgnPGxpIGNsYXNzPVwiZWxlbWVudCAnK25pY2VLZXkrJ1wiPjxpZnJhbWUgc3JjPVwiYWJvdXQ6YmxhbmtcIiBzY3JvbGxpbmc9XCJub1wiPjwvaWZyYW1lPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maW5kKCdpZnJhbWUnKS51bmlxdWVJZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maW5kKCdpZnJhbWUnKS5hdHRyKCdzcmMnLCBhcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udXJsKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7Ly93ZSd2ZSBnb3QgYSB0aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uc2FuZGJveCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyRnVuY3Rpb24gPSAnZGF0YS1sb2FkZXJmdW5jdGlvbj1cIicrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5sb2FkZXJGdW5jdGlvbisnXCInO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtID0gJCgnPGxpIGNsYXNzPVwiZWxlbWVudCAnK25pY2VLZXkrJ1wiPjxpbWcgc3JjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udGh1bWJuYWlsKydcIiBkYXRhLXNyY2M9XCInK2FwcFVJLmJhc2VVcmwrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS51cmwrJ1wiIGRhdGEtaGVpZ2h0PVwiJyt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmhlaWdodCsnXCIgZGF0YS1zYW5kYm94PVwiXCIgJytsb2FkZXJGdW5jdGlvbisnPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtID0gJCgnPGxpIGNsYXNzPVwiZWxlbWVudCAnK25pY2VLZXkrJ1wiPjxpbWcgc3JjPVwiJythcHBVSS5iYXNlVXJsK3RoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0udGh1bWJuYWlsKydcIiBkYXRhLXNyY2M9XCInK2FwcFVJLmJhc2VVcmwrdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS51cmwrJ1wiIGRhdGEtaGVpZ2h0PVwiJyt0aGlzLmFsbEJsb2Nrcy5lbGVtZW50c1trZXldW3hdLmhlaWdodCsnXCI+PC9saT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uYXBwZW5kVG8oJyNtZW51ICNzZWNvbmQgdWwjZWxlbWVudHMnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3pvb21lciB3b3Jrc1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5hbGxCbG9ja3MuZWxlbWVudHNba2V5XVt4XS5oZWlnaHQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZUhlaWdodCA9IHRoaXMuYWxsQmxvY2tzLmVsZW1lbnRzW2tleV1beF0uaGVpZ2h0KjAuMjU7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVIZWlnaHQgPSAnYXV0byc7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maW5kKCdpZnJhbWUnKS56b29tZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMC4yNSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAyNzAsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiRHJhZyZEcm9wIE1lIVwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2RyYWdnYWJsZXNcbiAgICAgICAgICAgIGJ1aWxkZXJVSS5tYWtlRHJhZ2dhYmxlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBldmVudCBoYW5kbGVyIGZvciB3aGVuIHRoZSBiYWNrIGxpbmsgaXMgY2xpY2tlZFxuICAgICAgICAqL1xuICAgICAgICBiYWNrQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHNpdGUucGVuZGluZ0NoYW5nZXMgPT09IHRydWUgKSB7XG4gICAgICAgICAgICAgICAgJCgnI2JhY2tNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGJ1dHRvbiBmb3IgY29uZmlybWluZyBsZWF2aW5nIHRoZSBwYWdlXG4gICAgICAgICovXG4gICAgICAgIGJhY2tCdXR0b25Db25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2l0ZS5wZW5kaW5nQ2hhbmdlcyA9IGZhbHNlOy8vcHJldmVudCB0aGUgSlMgYWxlcnQgYWZ0ZXIgY29uZmlybWluZyB1c2VyIHdhbnRzIHRvIGxlYXZlXG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIG1ha2VzIHRoZSBibG9ja3MgYW5kIHRlbXBsYXRlcyBpbiB0aGUgc2lkZWJhciBkcmFnZ2FibGUgb250byB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIG1ha2VEcmFnZ2FibGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjZWxlbWVudHMgbGksICN0ZW1wbGF0ZXMgbGknKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgIGhlbHBlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCgnPGRpdiBzdHlsZT1cImhlaWdodDogMTAwcHg7IHdpZHRoOiAzMDBweDsgYmFja2dyb3VuZDogI0Y5RkFGQTsgYm94LXNoYWRvdzogNXB4IDVweCAxcHggcmdiYSgwLDAsMCwwLjEpOyB0ZXh0LWFsaWduOiBjZW50ZXI7IGxpbmUtaGVpZ2h0OiAxMDBweDsgZm9udC1zaXplOiAyOHB4OyBjb2xvcjogIzE2QTA4NVwiPjxzcGFuIGNsYXNzPVwiZnVpLWxpc3RcIj48L3NwYW4+PC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJldmVydDogJ2ludmFsaWQnLFxuICAgICAgICAgICAgICAgICAgICBhcHBlbmRUbzogJ2JvZHknLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0VG9Tb3J0YWJsZTogJyNwYWdlTGlzdCA+IHVsJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUubW92ZU1vZGUoJ29uJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHt9XG4gICAgICAgICAgICAgICAgfSk7IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI2VsZW1lbnRzIGxpIGEnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS51bmJpbmQoJ2NsaWNrJykuYmluZCgnY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBJbXBsZW1lbnRzIHRoZSBzaXRlIG9uIHRoZSBjYW52YXMsIGNhbGxlZCBmcm9tIHRoZSBTaXRlIG9iamVjdCB3aGVuIHRoZSBzaXRlRGF0YSBoYXMgY29tcGxldGVkIGxvYWRpbmdcbiAgICAgICAgKi9cbiAgICAgICAgcG9wdWxhdGVDYW52YXM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICBjb3VudGVyID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9sb29wIHRocm91Z2ggdGhlIHBhZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggaSBpbiBzaXRlLnBhZ2VzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBuZXdQYWdlID0gbmV3IFBhZ2UoaSwgc2l0ZS5wYWdlc1tpXSwgY291bnRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcblxuICAgICAgICAgICAgICAgIC8vc2V0IHRoaXMgcGFnZSBhcyBhY3RpdmU/XG4gICAgICAgICAgICAgICAgaWYoIGJ1aWxkZXJVSS5wYWdlSW5VcmwgPT09IGkgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1BhZ2Uuc2VsZWN0UGFnZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYWN0aXZhdGUgdGhlIGZpcnN0IHBhZ2VcbiAgICAgICAgICAgIGlmKHNpdGUuc2l0ZVBhZ2VzLmxlbmd0aCA+IDAgJiYgYnVpbGRlclVJLnBhZ2VJblVybCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNpdGUuc2l0ZVBhZ2VzWzBdLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIENhbnZhcyBsb2FkaW5nIG9uL29mZlxuICAgICAgICAqL1xuICAgICAgICBjYW52YXNMb2FkaW5nOiBmdW5jdGlvbiAodmFsdWUpIHtcblxuICAgICAgICAgICAgaWYgKCB2YWx1ZSA9PT0gJ29uJyAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVXcmFwcGVyJykucXVlcnlTZWxlY3RvckFsbCgnI2NhbnZhc092ZXJsYXknKS5sZW5ndGggPT09IDAgKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuXG4gICAgICAgICAgICAgICAgb3ZlcmxheS5zdHlsZS5kaXNwbGF5ID0gJ2ZsZXgnO1xuICAgICAgICAgICAgICAgICQob3ZlcmxheSkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIG92ZXJsYXkuaWQgPSAnY2FudmFzT3ZlcmxheSc7XG5cbiAgICAgICAgICAgICAgICBvdmVybGF5LmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwibG9hZGVyXCI+PHNwYW4+ezwvc3Bhbj48c3Bhbj59PC9zcGFuPjwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVXcmFwcGVyJykuYXBwZW5kQ2hpbGQob3ZlcmxheSk7XG5cbiAgICAgICAgICAgICAgICAkKCcjY2FudmFzT3ZlcmxheScpLmZhZGVJbig1MDApO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB2YWx1ZSA9PT0gJ29mZicgJiYgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZyYW1lV3JhcHBlcicpLnF1ZXJ5U2VsZWN0b3JBbGwoJyNjYW52YXNPdmVybGF5JykubGVuZ3RoID09PSAxICkge1xuXG4gICAgICAgICAgICAgICAgc2l0ZS5sb2FkZWQoKTtcblxuICAgICAgICAgICAgICAgICQoJyNjYW52YXNPdmVybGF5JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcblxuXG4gICAgLypcbiAgICAgICAgUGFnZSBjb25zdHJ1Y3RvclxuICAgICovXG4gICAgZnVuY3Rpb24gUGFnZSAocGFnZU5hbWUsIHBhZ2UsIGNvdW50ZXIpIHtcbiAgICBcbiAgICAgICAgdGhpcy5uYW1lID0gcGFnZU5hbWUgfHwgXCJcIjtcbiAgICAgICAgdGhpcy5wYWdlSUQgPSBwYWdlLnBhZ2VfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJlbnRVTCA9IHt9OyAvL3BhcmVudCBVTCBvbiB0aGUgY2FudmFzXG4gICAgICAgIHRoaXMuc3RhdHVzID0gJyc7Ly8nJywgJ25ldycgb3IgJ2NoYW5nZWQnXG4gICAgICAgIHRoaXMuc2NyaXB0cyA9IFtdOy8vdHJhY2tzIHNjcmlwdCBVUkxzIHVzZWQgb24gdGhpcyBwYWdlXG4gICAgICAgIFxuICAgICAgICB0aGlzLnBhZ2VTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBwYWdlLnBhZ2VzX3RpdGxlIHx8ICcnLFxuICAgICAgICAgICAgbWV0YV9kZXNjcmlwdGlvbjogcGFnZS5tZXRhX2Rlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgbWV0YV9rZXl3b3JkczogcGFnZS5tZXRhX2tleXdvcmRzIHx8ICcnLFxuICAgICAgICAgICAgaGVhZGVyX2luY2x1ZGVzOiBwYWdlLmhlYWRlcl9pbmNsdWRlcyB8fCAnJyxcbiAgICAgICAgICAgIHBhZ2VfY3NzOiBwYWdlLnBhZ2VfY3NzIHx8ICcnXG4gICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaXMucGFnZU1lbnVUZW1wbGF0ZSA9ICc8YSBocmVmPVwiXCIgY2xhc3M9XCJtZW51SXRlbUxpbmtcIj5wYWdlPC9hPjxzcGFuIGNsYXNzPVwicGFnZUJ1dHRvbnNcIj48YSBocmVmPVwiXCIgY2xhc3M9XCJmaWxlRWRpdCBmdWktbmV3XCI+PC9hPjxhIGhyZWY9XCJcIiBjbGFzcz1cImZpbGVEZWwgZnVpLWNyb3NzXCI+PGEgY2xhc3M9XCJidG4gYnRuLXhzIGJ0bi1wcmltYXJ5IGJ0bi1lbWJvc3NlZCBmaWxlU2F2ZSBmdWktY2hlY2tcIiBocmVmPVwiI1wiPjwvYT48L3NwYW4+PC9hPjwvc3Bhbj4nO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tZW51SXRlbSA9IHt9Oy8vcmVmZXJlbmNlIHRvIHRoZSBwYWdlcyBtZW51IGl0ZW0gZm9yIHRoaXMgcGFnZSBpbnN0YW5jZVxuICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtID0ge307Ly9yZWZlcmVuY2UgdG8gdGhlIGxpbmtzIGRyb3Bkb3duIGl0ZW0gZm9yIHRoaXMgcGFnZSBpbnN0YW5jZVxuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnRVTCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ1VMJyk7XG4gICAgICAgIHRoaXMucGFyZW50VUwuc2V0QXR0cmlidXRlKCdpZCcsIFwicGFnZVwiK2NvdW50ZXIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgbWFrZXMgdGhlIGNsaWNrZWQgcGFnZSBhY3RpdmVcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZWxlY3RQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NlbGVjdDonKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2codGhpcy5wYWdlU2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21hcmsgdGhlIG1lbnUgaXRlbSBhcyBhY3RpdmVcbiAgICAgICAgICAgIHNpdGUuZGVBY3RpdmF0ZUFsbCgpO1xuICAgICAgICAgICAgJCh0aGlzLm1lbnVJdGVtKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbGV0IFNpdGUga25vdyB3aGljaCBwYWdlIGlzIGN1cnJlbnRseSBhY3RpdmVcbiAgICAgICAgICAgIHNpdGUuc2V0QWN0aXZlKHRoaXMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2Rpc3BsYXkgdGhlIG5hbWUgb2YgdGhlIGFjdGl2ZSBwYWdlIG9uIHRoZSBjYW52YXNcbiAgICAgICAgICAgIHNpdGUucGFnZVRpdGxlLmlubmVySFRNTCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9sb2FkIHRoZSBwYWdlIHNldHRpbmdzIGludG8gdGhlIHBhZ2Ugc2V0dGluZ3MgbW9kYWxcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NUaXRsZS52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLnRpdGxlO1xuICAgICAgICAgICAgc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFEZXNjcmlwdGlvbi52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLm1ldGFfZGVzY3JpcHRpb247XG4gICAgICAgICAgICBzaXRlLmlucHV0UGFnZVNldHRpbmdzTWV0YUtleXdvcmRzLnZhbHVlID0gdGhpcy5wYWdlU2V0dGluZ3MubWV0YV9rZXl3b3JkcztcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NJbmNsdWRlcy52YWx1ZSA9IHRoaXMucGFnZVNldHRpbmdzLmhlYWRlcl9pbmNsdWRlcztcbiAgICAgICAgICAgIHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NQYWdlQ3NzLnZhbHVlID0gdGhpcy5wYWdlU2V0dGluZ3MucGFnZV9jc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy90cmlnZ2VyIGN1c3RvbSBldmVudFxuICAgICAgICAgICAgJCgnYm9keScpLnRyaWdnZXIoJ2NoYW5nZVBhZ2UnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZXNldCB0aGUgaGVpZ2h0cyBmb3IgdGhlIGJsb2NrcyBvbiB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBPYmplY3Qua2V5cyh0aGlzLmJsb2Nrc1tpXS5mcmFtZURvY3VtZW50KS5sZW5ndGggPiAwICl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tzW2ldLmhlaWdodEFkanVzdG1lbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zaG93IHRoZSBlbXB0eSBtZXNzYWdlP1xuICAgICAgICAgICAgdGhpcy5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjaGFuZ2VkIHRoZSBsb2NhdGlvbi9vcmRlciBvZiBhIGJsb2NrIHdpdGhpbiBhIHBhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGZyYW1lSUQsIG5ld1Bvcykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3dlJ2xsIG5lZWQgdGhlIGJsb2NrIG9iamVjdCBjb25uZWN0ZWQgdG8gaWZyYW1lIHdpdGggZnJhbWVJRFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IodmFyIGkgaW4gdGhpcy5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5ibG9ja3NbaV0uZnJhbWUuZ2V0QXR0cmlidXRlKCdpZCcpID09PSBmcmFtZUlEICkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9jaGFuZ2UgdGhlIHBvc2l0aW9uIG9mIHRoaXMgYmxvY2sgaW4gdGhlIGJsb2NrcyBhcnJheVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5zcGxpY2UobmV3UG9zLCAwLCB0aGlzLmJsb2Nrcy5zcGxpY2UoaSwgMSlbMF0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBkZWxldGUgYmxvY2sgZnJvbSBibG9ja3MgYXJyYXlcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kZWxldGVCbG9jayA9IGZ1bmN0aW9uKGJsb2NrKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVtb3ZlIGZyb20gYmxvY2tzIGFycmF5XG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHRoaXMuYmxvY2tzICkge1xuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmJsb2Nrc1tpXSA9PT0gYmxvY2sgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZm91bmQgaXQsIHJlbW92ZSBmcm9tIGJsb2NrcyBhcnJheVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdG9nZ2xlcyBhbGwgYmxvY2sgZnJhbWVDb3ZlcnMgb24gdGhpcyBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudG9nZ2xlRnJhbWVDb3ZlcnMgPSBmdW5jdGlvbihvbk9yT2ZmKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5ibG9ja3MgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS50b2dnbGVDb3Zlcihvbk9yT2ZmKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNldHVwIGZvciBlZGl0aW5nIGEgcGFnZSBuYW1lXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuZWRpdFBhZ2VOYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCAhdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2VkaXQnKSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vaGlkZSB0aGUgbGlua1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignYS5tZW51SXRlbUxpbmsnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9pbnNlcnQgdGhlIGlucHV0IGZpZWxkXG4gICAgICAgICAgICAgICAgdmFyIG5ld0lucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC50eXBlID0gJ3RleHQnO1xuICAgICAgICAgICAgICAgIG5ld0lucHV0LnNldEF0dHJpYnV0ZSgnbmFtZScsICdwYWdlJyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5pbnNlcnRCZWZvcmUobmV3SW5wdXQsIHRoaXMubWVudUl0ZW0uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5ld0lucHV0LmZvY3VzKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0bXBTdHIgPSBuZXdJbnB1dC5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgICAgICAgICAgbmV3SW5wdXQuc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKTtcbiAgICAgICAgICAgICAgICBuZXdJbnB1dC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdG1wU3RyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLmNsYXNzTGlzdC5hZGQoJ2VkaXQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgVXBkYXRlcyB0aGlzIHBhZ2UncyBuYW1lIChldmVudCBoYW5kbGVyIGZvciB0aGUgc2F2ZSBidXR0b24pXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudXBkYXRlUGFnZU5hbWVFdmVudCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0aGlzLm1lbnVJdGVtLmNsYXNzTGlzdC5jb250YWlucygnZWRpdCcpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9lbCBpcyB0aGUgY2xpY2tlZCBidXR0b24sIHdlJ2xsIG5lZWQgYWNjZXNzIHRvIHRoZSBpbnB1dFxuICAgICAgICAgICAgICAgIHZhciB0aGVJbnB1dCA9IHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInBhZ2VcIl0nKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL21ha2Ugc3VyZSB0aGUgcGFnZSdzIG5hbWUgaXMgT0tcbiAgICAgICAgICAgICAgICBpZiggc2l0ZS5jaGVja1BhZ2VOYW1lKHRoZUlucHV0LnZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYW1lID0gc2l0ZS5wcmVwUGFnZU5hbWUoIHRoZUlucHV0LnZhbHVlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwicGFnZVwiXScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EubWVudUl0ZW1MaW5rJykuaW5uZXJIVE1MID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EubWVudUl0ZW1MaW5rJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdlZGl0Jyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vdXBkYXRlIHRoZSBsaW5rcyBkcm9wZG93biBpdGVtXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0udGV4dCA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgdGhpcy5uYW1lK1wiLmh0bWxcIik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgcGFnZSBuYW1lIG9uIHRoZSBjYW52YXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5wYWdlVGl0bGUuaW5uZXJIVE1MID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vY2hhbmdlZCBwYWdlIHRpdGxlLCB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KHNpdGUucGFnZU5hbWVFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgdGhpcyBlbnRpcmUgcGFnZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2RlbGV0ZSBmcm9tIHRoZSBTaXRlXG4gICAgICAgICAgICBmb3IoIHZhciBpIGluIHNpdGUuc2l0ZVBhZ2VzICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBzaXRlLnNpdGVQYWdlc1tpXSA9PT0gdGhpcyApIHsvL2dvdCBhIG1hdGNoIVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgZnJvbSBzaXRlLnNpdGVQYWdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2RlbGV0ZSBmcm9tIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFVMLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hZGQgdG8gZGVsZXRlZCBwYWdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlLnBhZ2VzVG9EZWxldGUucHVzaCh0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9kZWxldGUgdGhlIHBhZ2UncyBtZW51IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51SXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXQgdGhlIHBhZ2VzIGxpbmsgZHJvcGRvd24gaXRlbVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmtzRHJvcGRvd25JdGVtLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9hY3RpdmF0ZSB0aGUgZmlyc3QgcGFnZVxuICAgICAgICAgICAgICAgICAgICBzaXRlLnNpdGVQYWdlc1swXS5zZWxlY3RQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3BhZ2Ugd2FzIGRlbGV0ZWQsIHNvIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2hlY2tzIGlmIHRoZSBwYWdlIGlzIGVtcHR5LCBpZiBzbyBzaG93IHRoZSAnZW1wdHknIG1lc3NhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0aGlzLmJsb2Nrcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc2l0ZS5tZXNzYWdlU3RhcnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgc2l0ZS5kaXZGcmFtZVdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZW1wdHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUubWVzc2FnZVN0YXJ0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgc2l0ZS5kaXZGcmFtZVdyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgnZW1wdHknKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBwcmVwcy9zdHJpcHMgdGhpcyBwYWdlIGRhdGEgZm9yIGEgcGVuZGluZyBhamF4IHJlcXVlc3RcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcmVwRm9yU2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHBhZ2UubmFtZSA9IHRoaXMubmFtZTtcbiAgICAgICAgICAgIHBhZ2UucGFnZVNldHRpbmdzID0gdGhpcy5wYWdlU2V0dGluZ3M7XG4gICAgICAgICAgICBwYWdlLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICAgICAgICAgICAgcGFnZS5wYWdlSUQgPSB0aGlzLnBhZ2VJRDtcbiAgICAgICAgICAgIHBhZ2UuYmxvY2tzID0gW107XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9wcm9jZXNzIHRoZSBibG9ja3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciB4ID0gMDsgeCA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgeCsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5ibG9ja3NbeF0uc2FuZGJveCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suZnJhbWVDb250ZW50ID0gXCI8aHRtbD5cIiskKCcjc2FuZGJveGVzICMnK3RoaXMuYmxvY2tzW3hdLnNhbmRib3gpLmNvbnRlbnRzKCkuZmluZCgnaHRtbCcpLmh0bWwoKStcIjwvaHRtbD5cIjtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suc2FuZGJveCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmxvYWRlckZ1bmN0aW9uID0gdGhpcy5ibG9ja3NbeF0uc2FuZGJveF9sb2FkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmZyYW1lQ29udGVudCA9IHRoaXMuYmxvY2tzW3hdLmdldFNvdXJjZSgpO1xuICAgICAgICAgICAgICAgICAgICBibG9jay5zYW5kYm94ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGJsb2NrLmxvYWRlckZ1bmN0aW9uID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2suZnJhbWVIZWlnaHQgPSB0aGlzLmJsb2Nrc1t4XS5mcmFtZUhlaWdodDtcbiAgICAgICAgICAgICAgICBibG9jay5vcmlnaW5hbFVybCA9IHRoaXMuYmxvY2tzW3hdLm9yaWdpbmFsVXJsO1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy5ibG9ja3NbeF0uZ2xvYmFsICkgYmxvY2suZnJhbWVzX2dsb2JhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGFnZS5ibG9ja3MucHVzaChibG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZ2VuZXJhdGVzIHRoZSBmdWxsIHBhZ2UsIHVzaW5nIHNrZWxldG9uLmh0bWxcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5mdWxsUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFnZSA9IHRoaXM7Ly9yZWZlcmVuY2UgdG8gc2VsZiBmb3IgbGF0ZXJcbiAgICAgICAgICAgIHBhZ2Uuc2NyaXB0cyA9IFtdOy8vbWFrZSBzdXJlIGl0J3MgZW1wdHksIHdlJ2xsIHN0b3JlIHNjcmlwdCBVUkxzIGluIHRoZXJlIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBuZXdEb2NNYWluUGFyZW50ID0gJCgnaWZyYW1lI3NrZWxldG9uJykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbXB0eSBvdXQgdGhlIHNrZWxldG9uIGZpcnN0XG4gICAgICAgICAgICAkKCdpZnJhbWUjc2tlbGV0b24nKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmh0bWwoJycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgc2NyaXB0IHRhZ3NcbiAgICAgICAgICAgICQoJ2lmcmFtZSNza2VsZXRvbicpLmNvbnRlbnRzKCkuZmluZCggJ3NjcmlwdCcgKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdGhlQ29udGVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5ibG9ja3MgKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9ncmFiIHRoZSBibG9jayBjb250ZW50XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tzW2ldLnNhbmRib3ggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQoJyNzYW5kYm94ZXMgIycrdGhpcy5ibG9ja3NbaV0uc2FuZGJveCkuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQodGhpcy5ibG9ja3NbaV0uZnJhbWVEb2N1bWVudC5ib2R5KS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9yZW1vdmUgdmlkZW8gZnJhbWVDb3ZlcnNcbiAgICAgICAgICAgICAgICB0aGVDb250ZW50cy5maW5kKCcuZnJhbWVDb3ZlcicpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIHZpZGVvIGZyYW1lV3JhcHBlcnNcbiAgICAgICAgICAgICAgICB0aGVDb250ZW50cy5maW5kKCcudmlkZW9XcmFwcGVyJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNudCA9ICQodGhpcykuY29udGVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZXBsYWNlV2l0aChjbnQpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBzdHlsZSBsZWZ0b3ZlcnMgZnJvbSB0aGUgc3R5bGUgZWRpdG9yXG4gICAgICAgICAgICAgICAgZm9yKCB2YXIga2V5IGluIGJDb25maWcuZWRpdGFibGVJdGVtcyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgga2V5ICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ2RhdGEtc2VsZWN0b3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoJ291dGxpbmUnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnb3V0bGluZS1vZmZzZXQnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcygnY3Vyc29yJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS5hdHRyKCdzdHlsZScpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlbW92ZSBzdHlsZSBsZWZ0b3ZlcnMgZnJvbSB0aGUgY29udGVudCBlZGl0b3JcbiAgICAgICAgICAgICAgICBmb3IgKCB2YXIgeCA9IDA7IHggPCBiQ29uZmlnLmVkaXRhYmxlQ29udGVudC5sZW5ndGg7ICsreCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCggYkNvbmZpZy5lZGl0YWJsZUNvbnRlbnRbeF0gKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQXR0cignZGF0YS1zZWxlY3RvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vYXBwZW5kIHRvIERPTSBpbiB0aGUgc2tlbGV0b25cbiAgICAgICAgICAgICAgICBuZXdEb2NNYWluUGFyZW50LmFwcGVuZCggJCh0aGVDb250ZW50cy5odG1sKCkpICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kbyB3ZSBuZWVkIHRvIGluamVjdCBhbnkgc2NyaXB0cz9cbiAgICAgICAgICAgICAgICB2YXIgc2NyaXB0cyA9ICQodGhpcy5ibG9ja3NbaV0uZnJhbWVEb2N1bWVudC5ib2R5KS5maW5kKCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICB2YXIgdGhlSWZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJza2VsZXRvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHNjcmlwdHMuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdHMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NyaXB0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS50ZXh0KCkgIT09ICcnICkgey8vc2NyaXB0IHRhZ3Mgd2l0aCBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0ID0gdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5pbm5lckhUTUwgPSAkKHRoaXMpLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggJCh0aGlzKS5hdHRyKCdzcmMnKSAhPT0gbnVsbCAmJiBwYWdlLnNjcmlwdHMuaW5kZXhPZigkKHRoaXMpLmF0dHIoJ3NyYycpKSA9PT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy91c2UgaW5kZXhPZiB0byBtYWtlIHN1cmUgZWFjaCBzY3JpcHQgb25seSBhcHBlYXJzIG9uIHRoZSBwcm9kdWNlZCBwYWdlIG9uY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQgPSB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2Uuc2NyaXB0cy5wdXNoKCQodGhpcykuYXR0cignc3JjJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgICAgIENoZWNrcyBpZiBhbGwgYmxvY2tzIG9uIHRoaXMgcGFnZSBoYXZlIGZpbmlzaGVkIGxvYWRpbmdcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8dGhpcy5ibG9ja3MubGVuZ3RoOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoICF0aGlzLmJsb2Nrc1tpXS5sb2FkZWQgKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2xlYXIgb3V0IHRoaXMgcGFnZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXMuYmxvY2tzLnBvcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSggYmxvY2sgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jay5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jayA9IHRoaXMuYmxvY2tzLnBvcCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgSGVpZ2h0IGFkanVzdG1lbnQgZm9yIGFsbCBibG9ja3Mgb24gdGhlIHBhZ2VcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5oZWlnaHRBZGp1c3RtZW50ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5oZWlnaHRBZGp1c3RtZW50KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy9sb29wIHRocm91Z2ggdGhlIGZyYW1lcy9ibG9ja3NcbiAgICAgICAgXG4gICAgICAgIGlmKCBwYWdlLmhhc093blByb3BlcnR5KCdibG9ja3MnKSApIHtcbiAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciB4ID0gMDsgeCA8IHBhZ2UuYmxvY2tzLmxlbmd0aDsgeCsrICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9jcmVhdGUgbmV3IEJsb2NrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbmV3QmxvY2sgPSBuZXcgQmxvY2soKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHBhZ2UuYmxvY2tzW3hdLnNyYyA9IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9nZXRmcmFtZS9cIitwYWdlLmJsb2Nrc1t4XS5mcmFtZXNfaWQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zYW5kYm94ZWQgYmxvY2s/XG4gICAgICAgICAgICAgICAgaWYoIHBhZ2UuYmxvY2tzW3hdLmZyYW1lc19zYW5kYm94ID09PSAnMScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2suc2FuZGJveCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLnNhbmRib3hfbG9hZGVyID0gcGFnZS5ibG9ja3NbeF0uZnJhbWVzX2xvYWRlcmZ1bmN0aW9uO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXdCbG9jay5mcmFtZUlEID0gcGFnZS5ibG9ja3NbeF0uZnJhbWVzX2lkO1xuICAgICAgICAgICAgICAgIGlmICggcGFnZS5ibG9ja3NbeF0uZnJhbWVzX2dsb2JhbCA9PT0gJzEnICkgbmV3QmxvY2suZ2xvYmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBuZXdCbG9jay5jcmVhdGVQYXJlbnRMSShwYWdlLmJsb2Nrc1t4XS5mcmFtZXNfaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBuZXdCbG9jay5jcmVhdGVGcmFtZShwYWdlLmJsb2Nrc1t4XSk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlRnJhbWVDb3ZlcigpO1xuICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmluc2VydEJsb2NrSW50b0RvbSh0aGlzLnBhcmVudFVMKTtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0Jsb2NrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9hZGQgdGhlIGJsb2NrIHRvIHRoZSBuZXcgcGFnZVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tzLnB1c2gobmV3QmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vYWRkIHRoaXMgcGFnZSB0byB0aGUgc2l0ZSBvYmplY3RcbiAgICAgICAgc2l0ZS5zaXRlUGFnZXMucHVzaCggdGhpcyApO1xuICAgICAgICBcbiAgICAgICAgLy9wbGFudCB0aGUgbmV3IFVMIGluIHRoZSBET00gKG9uIHRoZSBjYW52YXMpXG4gICAgICAgIHNpdGUuZGl2Q2FudmFzLmFwcGVuZENoaWxkKHRoaXMucGFyZW50VUwpO1xuICAgICAgICBcbiAgICAgICAgLy9tYWtlIHRoZSBibG9ja3MvZnJhbWVzIGluIGVhY2ggcGFnZSBzb3J0YWJsZVxuICAgICAgICBcbiAgICAgICAgdmFyIHRoZVBhZ2UgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgJCh0aGlzLnBhcmVudFVMKS5zb3J0YWJsZSh7XG4gICAgICAgICAgICByZXZlcnQ6IHRydWUsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJkcm9wLWhvdmVyXCIsXG4gICAgICAgICAgICBoYW5kbGU6ICcuZHJhZ0Jsb2NrJyxcbiAgICAgICAgICAgIGNhbmNlbDogJycsXG4gICAgICAgICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2l0ZS5tb3ZlTW9kZSgnb2ZmJyk7XG4gICAgICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAoICFzaXRlLmxvYWRlZCgpICkgYnVpbGRlclVJLmNhbnZhc0xvYWRpbmcoJ29uJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmVmb3JlU3RvcDogZnVuY3Rpb24oZXZlbnQsIHVpKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3RlbXBsYXRlIG9yIHJlZ3VsYXIgYmxvY2s/XG4gICAgICAgICAgICAgICAgdmFyIGF0dHIgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtZnJhbWVzJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbmV3QmxvY2s7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciAhPT0gdHlwZW9mIHVuZGVmaW5lZCAmJiBhdHRyICE9PSBmYWxzZSkgey8vdGVtcGxhdGUsIGJ1aWxkIGl0XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjc3RhcnQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vY2xlYXIgb3V0IGFsbCBibG9ja3Mgb24gdGhpcyBwYWdlICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGVQYWdlLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2NyZWF0ZSB0aGUgbmV3IGZyYW1lc1xuICAgICAgICAgICAgICAgICAgICB2YXIgZnJhbWVJRHMgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtZnJhbWVzJykuc3BsaXQoJy0nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhlaWdodHMgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtaGVpZ2h0cycpLnNwbGl0KCctJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmxzID0gdWkuaXRlbS5hdHRyKCdkYXRhLW9yaWdpbmFsdXJscycpLnNwbGl0KCctJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZm9yKCB2YXIgeCA9IDA7IHggPCBmcmFtZUlEcy5sZW5ndGg7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QmxvY2suY3JlYXRlUGFyZW50TEkoaGVpZ2h0c1t4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZURhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVEYXRhLnNyYyA9IGFwcFVJLnNpdGVVcmwrJ3NpdGVzL2dldGZyYW1lLycrZnJhbWVJRHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX29yaWdpbmFsX3VybCA9IGFwcFVJLnNpdGVVcmwrJ3NpdGVzL2dldGZyYW1lLycrZnJhbWVJRHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX2hlaWdodCA9IGhlaWdodHNbeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lKCBmcmFtZURhdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmNyZWF0ZUZyYW1lQ292ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLmluc2VydEJsb2NrSW50b0RvbSh0aGVQYWdlLnBhcmVudFVMKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9hZGQgdGhlIGJsb2NrIHRvIHRoZSBuZXcgcGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUGFnZS5ibG9ja3MucHVzaChuZXdCbG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZHJvcHBlZCBlbGVtZW50LCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vc2V0IHRoZSB0ZW1wYXRlSURcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlclVJLnRlbXBsYXRlSUQgPSB1aS5pdGVtLmF0dHIoJ2RhdGEtcGFnZWlkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9tYWtlIHN1cmUgbm90aGluZyBnZXRzIGRyb3BwZWQgaW4gdGhlIGxzaXRcbiAgICAgICAgICAgICAgICAgICAgdWkuaXRlbS5odG1sKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZGVsZXRlIGRyYWcgcGxhY2UgaG9sZGVyXG4gICAgICAgICAgICAgICAgICAgICQoJ2JvZHkgLnVpLXNvcnRhYmxlLWhlbHBlcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2Ugey8vcmVndWxhciBibG9ja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL2FyZSB3ZSBkZWFsaW5nIHdpdGggYSBuZXcgYmxvY2sgYmVpbmcgZHJvcHBlZCBvbnRvIHRoZSBjYW52YXMsIG9yIGEgcmVvcmRlcmluZyBvZyBibG9ja3MgYWxyZWFkeSBvbiB0aGUgY2FudmFzP1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggdWkuaXRlbS5maW5kKCcuZnJhbWVDb3ZlciA+IGJ1dHRvbicpLnNpemUoKSA+IDAgKSB7Ly9yZS1vcmRlcmluZyBvZiBibG9ja3Mgb24gY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ubyBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBibG9jayBvYmplY3QsIHdlIHNpbXBseSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgcG9zaXRpb24gb2YgdGhlIGV4aXN0aW5nIGJsb2NrIGluIHRoZSBTaXRlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9pcyBjaGFuZ2VkIHRvIHJlZmxlY3QgdGhlIG5ldyBwb3NpdGlvbiBvZiB0aGUgYmxvY2sgb24gdGggY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZyYW1lSUQgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UG9zID0gdWkuaXRlbS5pbmRleCgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5zZXRQb3NpdGlvbihmcmFtZUlELCBuZXdQb3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugey8vbmV3IGJsb2NrIG9uIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL25ldyBibG9jayAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9jayA9IG5ldyBCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrLnBsYWNlT25DYW52YXModWkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XG5cbiAgICAgICAgICAgICAgICBzaXRlLm1vdmVNb2RlKCdvbicpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdWkuaXRlbS5maW5kKCcuZnJhbWVDb3ZlcicpLnNpemUoKSAhPT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRlclVJLmZyYW1lQ29udGVudHMgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuaHRtbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG92ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNzdGFydCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0byB0aGUgcGFnZXMgbWVudVxuICAgICAgICB0aGlzLm1lbnVJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTEknKTtcbiAgICAgICAgdGhpcy5tZW51SXRlbS5pbm5lckhUTUwgPSB0aGlzLnBhZ2VNZW51VGVtcGxhdGU7XG4gICAgICAgIFxuICAgICAgICAkKHRoaXMubWVudUl0ZW0pLmZpbmQoJ2E6Zmlyc3QnKS50ZXh0KHBhZ2VOYW1lKS5hdHRyKCdocmVmJywgJyNwYWdlJytjb3VudGVyKTtcbiAgICAgICAgXG4gICAgICAgIHZhciB0aGVMaW5rID0gJCh0aGlzLm1lbnVJdGVtKS5maW5kKCdhOmZpcnN0JykuZ2V0KDApO1xuICAgICAgICBcbiAgICAgICAgLy9iaW5kIHNvbWUgZXZlbnRzXG4gICAgICAgIHRoaXMubWVudUl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1lbnVJdGVtLnF1ZXJ5U2VsZWN0b3IoJ2EuZmlsZUVkaXQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5tZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdhLmZpbGVTYXZlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMubWVudUl0ZW0ucXVlcnlTZWxlY3RvcignYS5maWxlRGVsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0byB0aGUgcGFnZSBsaW5rIGRyb3Bkb3duXG4gICAgICAgIHRoaXMubGlua3NEcm9wZG93bkl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdPUFRJT04nKTtcbiAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgcGFnZU5hbWUrXCIuaHRtbFwiKTtcbiAgICAgICAgdGhpcy5saW5rc0Ryb3Bkb3duSXRlbS50ZXh0ID0gcGFnZU5hbWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJ1aWxkZXJVSS5kcm9wZG93blBhZ2VMaW5rcy5hcHBlbmRDaGlsZCggdGhpcy5saW5rc0Ryb3Bkb3duSXRlbSApO1xuICAgICAgICBcbiAgICAgICAgc2l0ZS5wYWdlc01lbnUuYXBwZW5kQ2hpbGQodGhpcy5tZW51SXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBQYWdlLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImNsaWNrXCI6IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZmlsZUVkaXQnKSApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0UGFnZU5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlU2F2ZScpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhZ2VOYW1lRXZlbnQoZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGVEZWwnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGVQYWdlID0gdGhpcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5vZmYoJ2NsaWNrJywgJyNkZWxldGVQYWdlQ29uZmlybScpLm9uKCdjbGljaycsICcjZGVsZXRlUGFnZUNvbmZpcm0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUGFnZS5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVQYWdlKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAgICBCbG9jayBjb25zdHJ1Y3RvclxuICAgICovXG4gICAgZnVuY3Rpb24gQmxvY2sgKCkge1xuICAgICAgICBcbiAgICAgICAgdGhpcy5mcmFtZUlEID0gMDtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zYW5kYm94ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2FuZGJveF9sb2FkZXIgPSAnJztcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAnJzsvLycnLCAnY2hhbmdlZCcgb3IgJ25ldydcbiAgICAgICAgdGhpcy5nbG9iYWwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFVybCA9ICcnO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wYXJlbnRMSSA9IHt9O1xuICAgICAgICB0aGlzLmZyYW1lQ292ZXIgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZSA9IHt9O1xuICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQgPSB7fTtcbiAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IDA7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmFubm90ID0ge307XG4gICAgICAgIHRoaXMuYW5ub3RUaW1lb3V0ID0ge307XG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY3JlYXRlcyB0aGUgcGFyZW50IGNvbnRhaW5lciAoTEkpXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY3JlYXRlUGFyZW50TEkgPSBmdW5jdGlvbihoZWlnaHQpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJyk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnZWxlbWVudCcpO1xuICAgICAgICAgICAgLy90aGlzLnBhcmVudExJLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnaGVpZ2h0OiAnK2hlaWdodCsncHgnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNyZWF0ZXMgdGhlIGlmcmFtZSBvbiB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuY3JlYXRlRnJhbWUgPSBmdW5jdGlvbihmcmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnSUZSQU1FJyk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZnJhbWVib3JkZXInLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdzY3JvbGxpbmcnLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc2V0QXR0cmlidXRlKCdzcmMnLCBmcmFtZS5zcmMpO1xuICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtb3JpZ2luYWx1cmwnLCBmcmFtZS5mcmFtZXNfb3JpZ2luYWxfdXJsKTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2luYWxVcmwgPSBmcmFtZS5mcmFtZXNfb3JpZ2luYWxfdXJsO1xuICAgICAgICAgICAgLy90aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnLCBmcmFtZS5mcmFtZXNfaGVpZ2h0KTtcbiAgICAgICAgICAgIC8vdGhpcy5mcmFtZUhlaWdodCA9IGZyYW1lLmZyYW1lc19oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5mcmFtZSkudW5pcXVlSWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zYW5kYm94P1xuICAgICAgICAgICAgaWYoIHRoaXMuc2FuZGJveCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbG9hZGVyZnVuY3Rpb24nLCB0aGlzLnNhbmRib3hfbG9hZGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lLnNldEF0dHJpYnV0ZSgnZGF0YS1zYW5kYm94JywgdGhpcy5zYW5kYm94KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3JlY3JlYXRlIHRoZSBzYW5kYm94ZWQgaWZyYW1lIGVsc2V3aGVyZVxuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94ZWRGcmFtZSA9ICQoJzxpZnJhbWUgc3JjPVwiJytmcmFtZS5zcmMrJ1wiIGlkPVwiJyt0aGlzLnNhbmRib3grJ1wiIHNhbmRib3g9XCJhbGxvdy1zYW1lLW9yaWdpblwiPjwvaWZyYW1lPicpO1xuICAgICAgICAgICAgICAgICQoJyNzYW5kYm94ZXMnKS5hcHBlbmQoIHNhbmRib3hlZEZyYW1lICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgaW5zZXJ0IHRoZSBpZnJhbWUgaW50byB0aGUgRE9NIG9uIHRoZSBjYW52YXNcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5pbnNlcnRCbG9ja0ludG9Eb20gPSBmdW5jdGlvbih0aGVVTCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLmFwcGVuZENoaWxkKHRoaXMuZnJhbWUpO1xuICAgICAgICAgICAgdGhlVUwuYXBwZW5kQ2hpbGQoIHRoaXMucGFyZW50TEkgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5mcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcywgZmFsc2UpO1xuXG4gICAgICAgICAgICBidWlsZGVyVUkuY2FudmFzTG9hZGluZygnb24nKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzZXRzIHRoZSBmcmFtZSBkb2N1bWVudCBmb3IgdGhlIGJsb2NrJ3MgaWZyYW1lXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0RnJhbWVEb2N1bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3NldCB0aGUgZnJhbWUgZG9jdW1lbnQgYXMgd2VsbFxuICAgICAgICAgICAgaWYoIHRoaXMuZnJhbWUuY29udGVudERvY3VtZW50ICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVEb2N1bWVudCA9IHRoaXMuZnJhbWUuY29udGVudERvY3VtZW50OyAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQgPSB0aGlzLmZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdGhpcy5oZWlnaHRBZGp1c3RtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjcmVhdGVzIHRoZSBmcmFtZSBjb3ZlciBhbmQgYmxvY2sgYWN0aW9uIGJ1dHRvblxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNyZWF0ZUZyYW1lQ292ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9idWlsZCB0aGUgZnJhbWUgY292ZXIgYW5kIGJsb2NrIGFjdGlvbiBidXR0b25zXG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5jbGFzc0xpc3QuYWRkKCdmcmFtZUNvdmVyJyk7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuY2xhc3NMaXN0LmFkZCgnZnJlc2gnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVsQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBkZWxCdXR0b24uc2V0QXR0cmlidXRlKCdjbGFzcycsICdidG4gYnRuLWludmVyc2UgYnRuLXNtIGRlbGV0ZUJsb2NrJyk7XG4gICAgICAgICAgICBkZWxCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgZGVsQnV0dG9uLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZ1aS10cmFzaFwiPjwvaT4gPHNwYW4+cmVtb3ZlPC9zcGFuPic7XG4gICAgICAgICAgICBkZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHJlc2V0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICByZXNldEJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2J0biBidG4taW52ZXJzZSBidG4tc20gcmVzZXRCbG9jaycpO1xuICAgICAgICAgICAgcmVzZXRCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgcmVzZXRCdXR0b24uaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZmEgZmEtcmVmcmVzaFwiPjwvaT4gPHNwYW4+cmVzZXQ8L3NwYW4+JztcbiAgICAgICAgICAgIHJlc2V0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBodG1sQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBodG1sQnV0dG9uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnYnRuIGJ0bi1pbnZlcnNlIGJ0bi1zbSBodG1sQmxvY2snKTtcbiAgICAgICAgICAgIGh0bWxCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgaHRtbEJ1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYSBmYS1jb2RlXCI+PC9pPiA8c3Bhbj5zb3VyY2U8L3NwYW4+JztcbiAgICAgICAgICAgIGh0bWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHZhciBkcmFnQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBkcmFnQnV0dG9uLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnYnRuIGJ0bi1pbnZlcnNlIGJ0bi1zbSBkcmFnQmxvY2snKTtcbiAgICAgICAgICAgIGRyYWdCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgZHJhZ0J1dHRvbi5pbm5lckhUTUwgPSAnPGkgY2xhc3M9XCJmYSBmYS1hcnJvd3NcIj48L2k+IDxzcGFuPk1vdmU8L3NwYW4+JztcbiAgICAgICAgICAgIGRyYWdCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHZhciBnbG9iYWxMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xBQkVMJyk7XG4gICAgICAgICAgICBnbG9iYWxMYWJlbC5jbGFzc0xpc3QuYWRkKCdjaGVja2JveCcpO1xuICAgICAgICAgICAgZ2xvYmFsTGFiZWwuY2xhc3NMaXN0LmFkZCgncHJpbWFyeScpO1xuICAgICAgICAgICAgdmFyIGdsb2JhbENoZWNrYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnSU5QVVQnKTtcbiAgICAgICAgICAgIGdsb2JhbENoZWNrYm94LnR5cGUgPSAnY2hlY2tib3gnO1xuICAgICAgICAgICAgZ2xvYmFsQ2hlY2tib3guc2V0QXR0cmlidXRlKCdkYXRhLXRvZ2dsZScsICdjaGVja2JveCcpO1xuICAgICAgICAgICAgZ2xvYmFsQ2hlY2tib3guY2hlY2tlZCA9IHRoaXMuZ2xvYmFsO1xuICAgICAgICAgICAgZ2xvYmFsTGFiZWwuYXBwZW5kQ2hpbGQoZ2xvYmFsQ2hlY2tib3gpO1xuICAgICAgICAgICAgdmFyIGdsb2JhbFRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnR2xvYmFsJyk7XG4gICAgICAgICAgICBnbG9iYWxMYWJlbC5hcHBlbmRDaGlsZChnbG9iYWxUZXh0KTtcblxuICAgICAgICAgICAgdmFyIHRyaWdnZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgICAgICB0cmlnZ2VyLmNsYXNzTGlzdC5hZGQoJ2Z1aS1nZWFyJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmFwcGVuZENoaWxkKGRlbEJ1dHRvbik7XG4gICAgICAgICAgICB0aGlzLmZyYW1lQ292ZXIuYXBwZW5kQ2hpbGQocmVzZXRCdXR0b24pO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmFwcGVuZENoaWxkKGh0bWxCdXR0b24pO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmFwcGVuZENoaWxkKGRyYWdCdXR0b24pO1xuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdmVyLmFwcGVuZENoaWxkKGdsb2JhbExhYmVsKTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3Zlci5hcHBlbmRDaGlsZCh0cmlnZ2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkuYXBwZW5kQ2hpbGQodGhpcy5mcmFtZUNvdmVyKTtcblxuICAgICAgICAgICAgdmFyIHRoZUJsb2NrID0gdGhpcztcblxuICAgICAgICAgICAgJChnbG9iYWxDaGVja2JveCkub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgICAgICB0aGVCbG9jay50b2dnbGVHbG9iYWwoZSk7XG5cbiAgICAgICAgICAgIH0pLnJhZGlvY2hlY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudG9nZ2xlR2xvYmFsID0gZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgaWYgKCBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCApIHRoaXMuZ2xvYmFsID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5nbG9iYWwgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy93ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGF1dG9tYXRpY2FsbHkgY29ycmVjdHMgdGhlIGhlaWdodCBvZiB0aGUgYmxvY2sncyBpZnJhbWUgZGVwZW5kaW5nIG9uIGl0cyBjb250ZW50XG4gICAgICAgICovXG4gICAgICAgIHRoaXMuaGVpZ2h0QWRqdXN0bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIE9iamVjdC5rZXlzKHRoaXMuZnJhbWVEb2N1bWVudCkubGVuZ3RoICE9PSAwICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHBhZ2VDb250YWluZXIgPSB0aGlzLmZyYW1lRG9jdW1lbnQuYm9keTtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gcGFnZUNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQrXCJweFwiO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5mcmFtZUNvdmVyLnN0eWxlLmhlaWdodCA9IGhlaWdodCtcInB4XCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZUhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgYSBibG9ja1xuICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3JlbW92ZSBmcm9tIERPTS9jYW52YXMgd2l0aCBhIG5pY2UgYW5pbWF0aW9uXG4gICAgICAgICAgICAkKHRoaXMuZnJhbWUucGFyZW50Tm9kZSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSBibG9ja3MgYXJyYXkgaW4gdGhlIGFjdGl2ZSBwYWdlXG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UuZGVsZXRlQmxvY2sodGhpcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuYm94XG4gICAgICAgICAgICBpZiggdGhpcy5zYW5iZG94ICkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCB0aGlzLnNhbmRib3ggKS5yZW1vdmUoKTsgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbGVtZW50IHdhcyBkZWxldGVkLCBzbyB3ZSd2ZSBnb3QgcGVuZGluZyBjaGFuZ2VcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcmVzZXRzIGEgYmxvY2sgdG8gaXQncyBvcmlnbmFsIHN0YXRlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoZmlyZUV2ZW50KSB7XG5cbiAgICAgICAgICAgIGlmICggdHlwZW9mIGZpcmVFdmVudCA9PT0gJ3VuZGVmaW5lZCcpIGZpcmVFdmVudCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVzZXQgZnJhbWUgYnkgcmVsb2FkaW5nIGl0XG4gICAgICAgICAgICB0aGlzLmZyYW1lLmNvbnRlbnRXaW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vc2FuZGJveD9cbiAgICAgICAgICAgIGlmKCB0aGlzLnNhbmRib3ggKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNhbmRib3hGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuc2FuZGJveCkuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTsgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2VsZW1lbnQgd2FzIGRlbGV0ZWQsIHNvIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG5cbiAgICAgICAgICAgIGJ1aWxkZXJVSS5jYW52YXNMb2FkaW5nKCdvbicpO1xuXG4gICAgICAgICAgICBpZiAoIGZpcmVFdmVudCApIHB1Ymxpc2hlci5wdWJsaXNoKCdvbkJsb2NrQ2hhbmdlJywgdGhpcywgJ3JlbG9hZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGxhdW5jaGVzIHRoZSBzb3VyY2UgY29kZSBlZGl0b3JcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zb3VyY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9oaWRlIHRoZSBpZnJhbWVcbiAgICAgICAgICAgIHRoaXMuZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kaXNhYmxlIHNvcnRhYmxlIG9uIHRoZSBwYXJlbnRMSVxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnBhcmVudE5vZGUpLnNvcnRhYmxlKCdkaXNhYmxlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYnVpbHQgZWRpdG9yIGVsZW1lbnRcbiAgICAgICAgICAgIHZhciB0aGVFZGl0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIHRoZUVkaXRvci5jbGFzc0xpc3QuYWRkKCdhY2VFZGl0b3InKTtcbiAgICAgICAgICAgICQodGhlRWRpdG9yKS51bmlxdWVJZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLmFwcGVuZENoaWxkKHRoZUVkaXRvcik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYnVpbGQgYW5kIGFwcGVuZCBlcnJvciBkcmF3ZXJcbiAgICAgICAgICAgIHZhciBuZXdMSSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJyk7XG4gICAgICAgICAgICB2YXIgZXJyb3JEcmF3ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIGVycm9yRHJhd2VyLmNsYXNzTGlzdC5hZGQoJ2Vycm9yRHJhd2VyJyk7XG4gICAgICAgICAgICBlcnJvckRyYXdlci5zZXRBdHRyaWJ1dGUoJ2lkJywgJ2Rpdl9lcnJvckRyYXdlcicpO1xuICAgICAgICAgICAgZXJyb3JEcmF3ZXIuaW5uZXJIVE1MID0gJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tZW1ib3NzZWQgYnRuLWRlZmF1bHQgYnV0dG9uX2NsZWFyRXJyb3JEcmF3ZXJcIiBpZD1cImJ1dHRvbl9jbGVhckVycm9yRHJhd2VyXCI+Q0xFQVI8L2J1dHRvbj4nO1xuICAgICAgICAgICAgbmV3TEkuYXBwZW5kQ2hpbGQoZXJyb3JEcmF3ZXIpO1xuICAgICAgICAgICAgZXJyb3JEcmF3ZXIucXVlcnlTZWxlY3RvcignYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudExJLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld0xJLCB0aGlzLnBhcmVudExJLm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYWNlLmNvbmZpZy5zZXQoXCJiYXNlUGF0aFwiLCBcIi9qcy92ZW5kb3IvYWNlXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgdGhlSWQgPSB0aGVFZGl0b3IuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICAgICAgdmFyIGVkaXRvciA9IGFjZS5lZGl0KCB0aGVJZCApO1xuXG4gICAgICAgICAgICAvL2VkaXRvci5nZXRTZXNzaW9uKCkuc2V0VXNlV3JhcE1vZGUodHJ1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlQ29udGFpbmVyID0gdGhpcy5mcmFtZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGJDb25maWcucGFnZUNvbnRhaW5lciApO1xuICAgICAgICAgICAgdmFyIHRoZUhUTUwgPSBwYWdlQ29udGFpbmVyLmlubmVySFRNTDtcbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoIHRoZUhUTUwgKTtcbiAgICAgICAgICAgIGVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS90d2lsaWdodFwiKTtcbiAgICAgICAgICAgIGVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL2h0bWxcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZWRpdG9yLmdldFNlc3Npb24oKS5vbihcImNoYW5nZUFubm90YXRpb25cIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBibG9jay5hbm5vdCA9IGVkaXRvci5nZXRTZXNzaW9uKCkuZ2V0QW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoYmxvY2suYW5ub3RUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgIHZhciB0aW1lb3V0Q291bnQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoICQoJyNkaXZfZXJyb3JEcmF3ZXIgcCcpLnNpemUoKSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dENvdW50ID0gYkNvbmZpZy5zb3VyY2VDb2RlRWRpdFN5bnRheERlbGF5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXRDb3VudCA9IDEwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYmxvY2suYW5ub3RUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBibG9jay5hbm5vdCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrLmFubm90Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBibG9jay5hbm5vdFtrZXldLnRleHQgIT09IFwiU3RhcnQgdGFnIHNlZW4gd2l0aG91dCBzZWVpbmcgYSBkb2N0eXBlIGZpcnN0LiBFeHBlY3RlZCBlLmcuIDwhRE9DVFlQRSBodG1sPi5cIiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0xpbmUgPSAkKCc8cD48L3A+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdLZXkgPSAkKCc8Yj4nK2Jsb2NrLmFubm90W2tleV0udHlwZSsnOiA8L2I+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdJbmZvID0gJCgnPHNwYW4+ICcrYmxvY2suYW5ub3Rba2V5XS50ZXh0ICsgXCJvbiBsaW5lIFwiICsgXCIgPGI+XCIgKyBibG9jay5hbm5vdFtrZXldLnJvdysnPC9iPjwvc3Bhbj4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGluZS5hcHBlbmQoIG5ld0tleSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdMaW5lLmFwcGVuZCggbmV3SW5mbyApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2Rpdl9lcnJvckRyYXdlcicpLmFwcGVuZCggbmV3TGluZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggJCgnI2Rpdl9lcnJvckRyYXdlcicpLmNzcygnZGlzcGxheScpID09PSAnbm9uZScgJiYgJCgnI2Rpdl9lcnJvckRyYXdlcicpLmZpbmQoJ3AnKS5zaXplKCkgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2Rpdl9lcnJvckRyYXdlcicpLnNsaWRlRG93bigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LCB0aW1lb3V0Q291bnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9idXR0b25zXG4gICAgICAgICAgICB2YXIgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQlVUVE9OJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bicpO1xuICAgICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1kYW5nZXInKTtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdlZGl0Q2FuY2VsQnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLXNtJyk7XG4gICAgICAgICAgICBjYW5jZWxCdXR0b24uaW5uZXJIVE1MID0gJzxpIGNsYXNzPVwiZnVpLWNyb3NzXCI+PC9pPiA8c3Bhbj5DYW5jZWw8L3NwYW4+JztcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNhdmVCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdCVVRUT04nKTtcbiAgICAgICAgICAgIHNhdmVCdXR0b24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2J1dHRvbicpO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKTtcbiAgICAgICAgICAgIHNhdmVCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLXByaW1hcnknKTtcbiAgICAgICAgICAgIHNhdmVCdXR0b24uY2xhc3NMaXN0LmFkZCgnZWRpdFNhdmVCdXR0b24nKTtcbiAgICAgICAgICAgIHNhdmVCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLXNtJyk7XG4gICAgICAgICAgICBzYXZlQnV0dG9uLmlubmVySFRNTCA9ICc8aSBjbGFzcz1cImZ1aS1jaGVja1wiPjwvaT4gPHNwYW4+U2F2ZTwvc3Bhbj4nO1xuICAgICAgICAgICAgc2F2ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJ1dHRvbldyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgIGJ1dHRvbldyYXBwZXIuY2xhc3NMaXN0LmFkZCgnZWRpdG9yQnV0dG9ucycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidXR0b25XcmFwcGVyLmFwcGVuZENoaWxkKCBjYW5jZWxCdXR0b24gKTtcbiAgICAgICAgICAgIGJ1dHRvbldyYXBwZXIuYXBwZW5kQ2hpbGQoIHNhdmVCdXR0b24gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5hcHBlbmRDaGlsZCggYnV0dG9uV3JhcHBlciApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBidWlsZGVyVUkuYWNlRWRpdG9yc1sgdGhlSWQgXSA9IGVkaXRvcjtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBjYW5jZWxzIHRoZSBibG9jayBzb3VyY2UgY29kZSBlZGl0b3JcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jYW5jZWxTb3VyY2VCbG9jayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvL2VuYWJsZSBkcmFnZ2FibGUgb24gdGhlIExJXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkucGFyZW50Tm9kZSkuc29ydGFibGUoJ2VuYWJsZScpO1xuXHRcdFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVycm9yRHJhd2VyXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkubmV4dFNpYmxpbmcpLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgICAgIC8vZGVsZXRlIHRoZSBlZGl0b3JcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmFjZUVkaXRvcicpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCh0aGlzLmZyYW1lKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnF1ZXJ5U2VsZWN0b3IoJy5lZGl0b3JCdXR0b25zJykpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVzIHRoZSBibG9ja3Mgc291cmNlIGNvZGVcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zYXZlU291cmNlQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9lbmFibGUgZHJhZ2dhYmxlIG9uIHRoZSBMSVxuICAgICAgICAgICAgJCh0aGlzLnBhcmVudExJLnBhcmVudE5vZGUpLnNvcnRhYmxlKCdlbmFibGUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRoZUlkID0gdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuYWNlRWRpdG9yJykuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICAgICAgdmFyIHRoZUNvbnRlbnQgPSBidWlsZGVyVUkuYWNlRWRpdG9yc1t0aGVJZF0uZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVycm9yRHJhd2VyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGl2X2Vycm9yRHJhd2VyJykucGFyZW50Tm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kZWxldGUgdGhlIGVkaXRvclxuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuYWNlRWRpdG9yJykucmVtb3ZlKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vdXBkYXRlIHRoZSBmcmFtZSdzIGNvbnRlbnRcbiAgICAgICAgICAgIHRoaXMuZnJhbWVEb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKS5pbm5lckhUTUwgPSB0aGVDb250ZW50O1xuICAgICAgICAgICAgdGhpcy5mcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zYW5kYm94ZWQ/XG4gICAgICAgICAgICBpZiggdGhpcy5zYW5kYm94ICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBzYW5kYm94RnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggdGhpcy5zYW5kYm94ICk7XG4gICAgICAgICAgICAgICAgdmFyIHNhbmRib3hGcmFtZURvY3VtZW50ID0gc2FuZGJveEZyYW1lLmNvbnRlbnREb2N1bWVudCB8fCBzYW5kYm94RnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBidWlsZGVyVUkudGVtcEZyYW1lID0gc2FuZGJveEZyYW1lO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNhbmRib3hGcmFtZURvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGJDb25maWcucGFnZUNvbnRhaW5lciApLmlubmVySFRNTCA9IHRoZUNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZG8gd2UgbmVlZCB0byBleGVjdXRlIGEgbG9hZGVyIGZ1bmN0aW9uP1xuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNhbmRib3hfbG9hZGVyICE9PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2RlVG9FeGVjdXRlID0gXCJzYW5kYm94RnJhbWUuY29udGVudFdpbmRvdy5cIit0aGlzLnNhbmRib3hfbG9hZGVyK1wiKClcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtcEZ1bmMgPSBuZXcgRnVuY3Rpb24oY29kZVRvRXhlY3V0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRtcEZ1bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmVkaXRvckJ1dHRvbnMnKSkuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2FkanVzdCBoZWlnaHQgb2YgdGhlIGZyYW1lXG4gICAgICAgICAgICB0aGlzLmhlaWdodEFkanVzdG1lbnQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9uZXcgcGFnZSBhZGRlZCwgd2UndmUgZ290IHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgc2l0ZS5zZXRQZW5kaW5nQ2hhbmdlcyh0cnVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9ibG9jayBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSAnY2hhbmdlZCc7XG5cbiAgICAgICAgICAgIHB1Ymxpc2hlci5wdWJsaXNoKCdvbkJsb2NrQ2hhbmdlJywgdGhpcywgJ2NoYW5nZScpO1xuXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNsZWFycyBvdXQgdGhlIGVycm9yIGRyYXdlclxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmNsZWFyRXJyb3JEcmF3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHBzID0gdGhpcy5wYXJlbnRMSS5uZXh0U2libGluZy5xdWVyeVNlbGVjdG9yQWxsKCdwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgcHNbaV0ucmVtb3ZlKCk7ICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICB0b2dnbGVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoaXMgYmxvY2sncyBmcmFtZUNvdmVyXG4gICAgICAgICovXG4gICAgICAgIHRoaXMudG9nZ2xlQ292ZXIgPSBmdW5jdGlvbihvbk9yT2ZmKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBvbk9yT2ZmID09PSAnT24nICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50TEkucXVlcnlTZWxlY3RvcignLmZyYW1lQ292ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiggb25Pck9mZiA9PT0gJ09mZicgKSB7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5xdWVyeVNlbGVjdG9yKCcuZnJhbWVDb3ZlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgcmV0dXJucyB0aGUgZnVsbCBzb3VyY2UgY29kZSBvZiB0aGUgYmxvY2sncyBmcmFtZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLmdldFNvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgc291cmNlID0gXCI8aHRtbD5cIjtcbiAgICAgICAgICAgIHNvdXJjZSArPSB0aGlzLmZyYW1lRG9jdW1lbnQuaGVhZC5vdXRlckhUTUw7XG4gICAgICAgICAgICBzb3VyY2UgKz0gdGhpcy5mcmFtZURvY3VtZW50LmJvZHkub3V0ZXJIVE1MO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHBsYWNlcyBhIGRyYWdnZWQvZHJvcHBlZCBibG9jayBmcm9tIHRoZSBsZWZ0IHNpZGViYXIgb250byB0aGUgY2FudmFzXG4gICAgICAgICovXG4gICAgICAgIHRoaXMucGxhY2VPbkNhbnZhcyA9IGZ1bmN0aW9uKHVpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZnJhbWUgZGF0YSwgd2UnbGwgbmVlZCB0aGlzIGJlZm9yZSBtZXNzaW5nIHdpdGggdGhlIGl0ZW0ncyBjb250ZW50IEhUTUxcbiAgICAgICAgICAgIHZhciBmcmFtZURhdGEgPSB7fSwgYXR0cjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLnNpemUoKSA+IDAgKSB7Ly9pZnJhbWUgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5zcmMgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5mcmFtZXNfb3JpZ2luYWxfdXJsID0gdWkuaXRlbS5maW5kKCdpZnJhbWUnKS5hdHRyKCdzcmMnKTtcbiAgICAgICAgICAgICAgICBmcmFtZURhdGEuZnJhbWVzX2hlaWdodCA9IHVpLml0ZW0uaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vc2FuZGJveGVkIGJsb2NrP1xuICAgICAgICAgICAgICAgIGF0dHIgPSB1aS5pdGVtLmZpbmQoJ2lmcmFtZScpLmF0dHIoJ3NhbmRib3gnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhdHRyICE9PSB0eXBlb2YgdW5kZWZpbmVkICYmIGF0dHIgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2FuZGJveCA9IHNpdGVCdWlsZGVyVXRpbHMuZ2V0UmFuZG9tQXJiaXRyYXJ5KDEwMDAwLCAxMDAwMDAwMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYW5kYm94X2xvYWRlciA9IHVpLml0ZW0uZmluZCgnaWZyYW1lJykuYXR0cignZGF0YS1sb2FkZXJmdW5jdGlvbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7Ly9pbWFnZSB0aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLnNyYyA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1zcmNjJyk7XG4gICAgICAgICAgICAgICAgZnJhbWVEYXRhLmZyYW1lc19vcmlnaW5hbF91cmwgPSB1aS5pdGVtLmZpbmQoJ2ltZycpLmF0dHIoJ2RhdGEtc3JjYycpO1xuICAgICAgICAgICAgICAgIGZyYW1lRGF0YS5mcmFtZXNfaGVpZ2h0ID0gdWkuaXRlbS5maW5kKCdpbWcnKS5hdHRyKCdkYXRhLWhlaWdodCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9zYW5kYm94ZWQgYmxvY2s/XG4gICAgICAgICAgICAgICAgYXR0ciA9IHVpLml0ZW0uZmluZCgnaW1nJykuYXR0cignZGF0YS1zYW5kYm94Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciAhPT0gdHlwZW9mIHVuZGVmaW5lZCAmJiBhdHRyICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhbmRib3ggPSBzaXRlQnVpbGRlclV0aWxzLmdldFJhbmRvbUFyYml0cmFyeSgxMDAwMCwgMTAwMDAwMDAwMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2FuZGJveF9sb2FkZXIgPSB1aS5pdGVtLmZpbmQoJ2ltZycpLmF0dHIoJ2RhdGEtbG9hZGVyZnVuY3Rpb24nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2NyZWF0ZSB0aGUgbmV3IGJsb2NrIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5mcmFtZUlEID0gMDtcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkgPSB1aS5pdGVtLmdldCgwKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50TEkuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICduZXcnO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVGcmFtZShmcmFtZURhdGEpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRMSS5zdHlsZS5oZWlnaHQgPSB0aGlzLmZyYW1lSGVpZ2h0K1wicHhcIjtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRnJhbWVDb3ZlcigpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5mcmFtZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2luc2VydCB0aGUgY3JlYXRlZCBpZnJhbWVcbiAgICAgICAgICAgIHVpLml0ZW0uYXBwZW5kKCQodGhpcy5mcmFtZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9hZGQgdGhlIGJsb2NrIHRvIHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5ibG9ja3Muc3BsaWNlKHVpLml0ZW0uaW5kZXgoKSwgMCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2N1c3RvbSBldmVudFxuICAgICAgICAgICAgdWkuaXRlbS5maW5kKCdpZnJhbWUnKS50cmlnZ2VyKCdjYW52YXN1cGRhdGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kcm9wcGVkIGVsZW1lbnQsIHNvIHdlJ3ZlIGdvdCBwZW5kaW5nIGNoYW5nZXNcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuICAgICAgICAvKlxuICAgICAgICAgICAgaW5qZWN0cyBleHRlcm5hbCBKUyAoZGVmaW5lZCBpbiBjb25maWcuanMpIGludG8gdGhlIGJsb2NrXG4gICAgICAgICovXG4gICAgICAgIHRoaXMubG9hZEphdmFzY3JpcHQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBpLFxuICAgICAgICAgICAgICAgIG9sZCxcbiAgICAgICAgICAgICAgICBuZXdTY3JpcHQ7XG5cbiAgICAgICAgICAgIC8vcmVtb3ZlIG9sZCBvbmVzXG4gICAgICAgICAgICBvbGQgPSB0aGlzLmZyYW1lRG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0LmJ1aWxkZXInKTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBvbGQubGVuZ3RoOyBpKysgKSBvbGRbaV0ucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgIC8vaW5qZWN0XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGJDb25maWcuZXh0ZXJuYWxKUy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBuZXdTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdTQ1JJUFQnKTtcbiAgICAgICAgICAgICAgICBuZXdTY3JpcHQuY2xhc3NMaXN0LmFkZCgnYnVpbGRlcicpO1xuICAgICAgICAgICAgICAgIG5ld1NjcmlwdC5zcmMgPSBiQ29uZmlnLmV4dGVybmFsSlNbaV07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lRG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLmFwcGVuZENoaWxkKG5ld1NjcmlwdCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9OyAgXG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBCbG9jay5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJsb2FkXCI6IFxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVEb2N1bWVudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0QWRqdXN0bWVudCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEphdmFzY3JpcHQoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKHRoaXMuZnJhbWVDb3ZlcikucmVtb3ZlQ2xhc3MoJ2ZyZXNoJywgNTAwKTtcblxuICAgICAgICAgICAgICAgIHB1Ymxpc2hlci5wdWJsaXNoKCdvbkJsb2NrTG9hZGVkJywgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBidWlsZGVyVUkuY2FudmFzTG9hZGluZygnb2ZmJyk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgXCJjbGlja1wiOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciB0aGVCbG9jayA9IHRoaXM7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9maWd1cmUgb3V0IHdoYXQgdG8gZG8gbmV4dFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkZWxldGVCbG9jaycpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZGVsZXRlQmxvY2snKSApIHsvL2RlbGV0ZSB0aGlzIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbERlbGV0ZUJsb2NrKS5tb2RhbCgnc2hvdycpOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbERlbGV0ZUJsb2NrKS5vZmYoJ2NsaWNrJywgJyNkZWxldGVCbG9ja0NvbmZpcm0nKS5vbignY2xpY2snLCAnI2RlbGV0ZUJsb2NrQ29uZmlybScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVCbG9jay5kZWxldGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxEZWxldGVCbG9jaykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygncmVzZXRCbG9jaycpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygncmVzZXRCbG9jaycpICkgey8vcmVzZXQgdGhlIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKGJ1aWxkZXJVSS5tb2RhbFJlc2V0QmxvY2spLm1vZGFsKCdzaG93Jyk7IFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChidWlsZGVyVUkubW9kYWxSZXNldEJsb2NrKS5vZmYoJ2NsaWNrJywgJyNyZXNldEJsb2NrQ29uZmlybScpLm9uKCdjbGljaycsICcjcmVzZXRCbG9ja0NvbmZpcm0nLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2sucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoYnVpbGRlclVJLm1vZGFsUmVzZXRCbG9jaykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnaHRtbEJsb2NrJykgfHwgZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCdodG1sQmxvY2snKSApIHsvL3NvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suc291cmNlKCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiggZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnZWRpdENhbmNlbEJ1dHRvbicpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZWRpdENhbmNlbEJ1dHRvbicpICkgey8vY2FuY2VsIHNvdXJjZSBjb2RlIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlQmxvY2suY2FuY2VsU291cmNlQmxvY2soKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdlZGl0U2F2ZUJ1dHRvbicpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmNsYXNzTGlzdC5jb250YWlucygnZWRpdFNhdmVCdXR0b24nKSApIHsvL3NhdmUgc291cmNlIGNvZGVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUJsb2NrLnNhdmVTb3VyY2VCbG9jaygpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2J1dHRvbl9jbGVhckVycm9yRHJhd2VyJykgKSB7Ly9jbGVhciBlcnJvciBkcmF3ZXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZUJsb2NrLmNsZWFyRXJyb3JEcmF3ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLypcbiAgICAgICAgU2l0ZSBvYmplY3QgbGl0ZXJhbFxuICAgICovXG4gICAgLypqc2hpbnQgLVcwMDMgKi9cbiAgICB2YXIgc2l0ZSA9IHtcbiAgICAgICAgXG4gICAgICAgIHBlbmRpbmdDaGFuZ2VzOiBmYWxzZSwgICAgICAvL3BlbmRpbmcgY2hhbmdlcyBvciBubz9cbiAgICAgICAgcGFnZXM6IHt9LCAgICAgICAgICAgICAgICAgIC8vYXJyYXkgY29udGFpbmluZyBhbGwgcGFnZXMsIGluY2x1ZGluZyB0aGUgY2hpbGQgZnJhbWVzLCBsb2FkZWQgZnJvbSB0aGUgc2VydmVyIG9uIHBhZ2UgbG9hZFxuICAgICAgICBpc19hZG1pbjogMCwgICAgICAgICAgICAgICAgLy8wIGZvciBub24tYWRtaW4sIDEgZm9yIGFkbWluXG4gICAgICAgIGRhdGE6IHt9LCAgICAgICAgICAgICAgICAgICAvL2NvbnRhaW5lciBmb3IgYWpheCBsb2FkZWQgc2l0ZSBkYXRhXG4gICAgICAgIHBhZ2VzVG9EZWxldGU6IFtdLCAgICAgICAgICAvL2NvbnRhaW5zIHBhZ2VzIHRvIGJlIGRlbGV0ZWRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2l0ZVBhZ2VzOiBbXSwgICAgICAgICAgICAgIC8vdGhpcyBpcyB0aGUgb25seSB2YXIgY29udGFpbmluZyB0aGUgcmVjZW50IGNhbnZhcyBjb250ZW50c1xuICAgICAgICBcbiAgICAgICAgc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXI6IHt9LCAgICAgLy9jb250YWlucyB0aGUgc2l0ZSBkYXRhIHJlYWR5IHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgICAgICBcbiAgICAgICAgYWN0aXZlUGFnZToge30sICAgICAgICAgICAgIC8vaG9sZHMgYSByZWZlcmVuY2UgdG8gdGhlIHBhZ2UgY3VycmVudGx5IG9wZW4gb24gdGhlIGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgcGFnZVRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZVRpdGxlJyksLy9ob2xkcyB0aGUgcGFnZSB0aXRsZSBvZiB0aGUgY3VycmVudCBwYWdlIG9uIHRoZSBjYW52YXNcbiAgICAgICAgXG4gICAgICAgIGRpdkNhbnZhczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VMaXN0JyksLy9ESVYgY29udGFpbmluZyBhbGwgcGFnZXMgb24gdGhlIGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgcGFnZXNNZW51OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZXMnKSwgLy9VTCBjb250YWluaW5nIHRoZSBwYWdlcyBtZW51IGluIHRoZSBzaWRlYmFyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGJ1dHRvbk5ld1BhZ2U6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGRQYWdlJyksXG4gICAgICAgIGxpTmV3UGFnZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld1BhZ2VMSScpLFxuICAgICAgICBcbiAgICAgICAgaW5wdXRQYWdlU2V0dGluZ3NUaXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VEYXRhX3RpdGxlJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzTWV0YURlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZURhdGFfbWV0YURlc2NyaXB0aW9uJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzTWV0YUtleXdvcmRzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZURhdGFfbWV0YUtleXdvcmRzJyksXG4gICAgICAgIGlucHV0UGFnZVNldHRpbmdzSW5jbHVkZXM6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9oZWFkZXJJbmNsdWRlcycpLFxuICAgICAgICBpbnB1dFBhZ2VTZXR0aW5nc1BhZ2VDc3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlRGF0YV9oZWFkZXJDc3MnKSxcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvblN1Ym1pdFBhZ2VTZXR0aW5nczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2VTZXR0aW5nc1N1Ym1pdHRCdXR0b24nKSxcbiAgICAgICAgXG4gICAgICAgIG1vZGFsUGFnZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZVNldHRpbmdzTW9kYWwnKSxcbiAgICAgICAgXG4gICAgICAgIGJ1dHRvblNhdmU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzYXZlUGFnZScpLFxuICAgICAgICBcbiAgICAgICAgbWVzc2FnZVN0YXJ0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKSxcbiAgICAgICAgZGl2RnJhbWVXcmFwcGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZnJhbWVXcmFwcGVyJyksXG4gICAgICAgIFxuICAgICAgICBza2VsZXRvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NrZWxldG9uJyksXG5cdFx0XG5cdFx0YXV0b1NhdmVUaW1lcjoge30sXG4gICAgICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJC5nZXRKU09OKGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9zaXRlRGF0YVwiLCBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggZGF0YS5zaXRlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpdGUuZGF0YSA9IGRhdGEuc2l0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIGRhdGEucGFnZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgc2l0ZS5wYWdlcyA9IGRhdGEucGFnZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNpdGUuaXNfYWRtaW4gPSBkYXRhLmlzX2FkbWluO1xuICAgICAgICAgICAgICAgIFxuXHRcdFx0XHRpZiggJCgnI3BhZ2VMaXN0Jykuc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICBcdGJ1aWxkZXJVSS5wb3B1bGF0ZUNhbnZhcygpO1xuXHRcdFx0XHR9XG5cbiAgICAgICAgICAgICAgICBpZiggZGF0YS5zaXRlLnZpZXdtb2RlICkge1xuICAgICAgICAgICAgICAgICAgICBwdWJsaXNoZXIucHVibGlzaCgnb25TZXRNb2RlJywgZGF0YS5zaXRlLnZpZXdtb2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9maXJlIGN1c3RvbSBldmVudFxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdzaXRlRGF0YUxvYWRlZCcpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25OZXdQYWdlKS5vbignY2xpY2snLCBzaXRlLm5ld1BhZ2UpO1xuICAgICAgICAgICAgJCh0aGlzLm1vZGFsUGFnZVNldHRpbmdzKS5vbignc2hvdy5icy5tb2RhbCcsIHNpdGUubG9hZFBhZ2VTZXR0aW5ncyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU3VibWl0UGFnZVNldHRpbmdzKS5vbignY2xpY2snLCBzaXRlLnVwZGF0ZVBhZ2VTZXR0aW5ncyk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU2F2ZSkub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtzaXRlLnNhdmUodHJ1ZSk7fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vYXV0byBzYXZlIHRpbWUgXG4gICAgICAgICAgICB0aGlzLmF1dG9TYXZlVGltZXIgPSBzZXRUaW1lb3V0KHNpdGUuYXV0b1NhdmUsIGJDb25maWcuYXV0b1NhdmVUaW1lb3V0KTtcblxuICAgICAgICAgICAgcHVibGlzaGVyLnN1YnNjcmliZSgnb25CbG9ja0NoYW5nZScsIGZ1bmN0aW9uIChibG9jaywgdHlwZSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCBibG9jay5nbG9iYWwgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgc2l0ZS5zaXRlUGFnZXMubGVuZ3RoOyBpKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIHZhciB5ID0gMDsgeSA8IHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrcy5sZW5ndGg7IHkgKysgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XSAhPT0gYmxvY2sgJiYgc2l0ZS5zaXRlUGFnZXNbaV0uYmxvY2tzW3ldLm9yaWdpbmFsVXJsID09PSBibG9jay5vcmlnaW5hbFVybCAmJiBzaXRlLnNpdGVQYWdlc1tpXS5ibG9ja3NbeV0uZ2xvYmFsICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdHlwZSA9PT0gJ2NoYW5nZScgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XS5mcmFtZURvY3VtZW50LmJvZHkgPSBibG9jay5mcmFtZURvY3VtZW50LmJvZHkuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoZXIucHVibGlzaCgnb25CbG9ja0xvYWRlZCcsIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ3JlbG9hZCcgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpdGUuc2l0ZVBhZ2VzW2ldLmJsb2Nrc1t5XS5yZXNldChmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGF1dG9TYXZlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihzaXRlLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgc2l0ZS5zYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIH1cblx0XHRcdFxuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5hdXRvU2F2ZVRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b1NhdmVUaW1lciA9IHNldFRpbWVvdXQoc2l0ZS5hdXRvU2F2ZSwgYkNvbmZpZy5hdXRvU2F2ZVRpbWVvdXQpO1xuICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgc2V0UGVuZGluZ0NoYW5nZXM6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSB2YWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHZhbHVlID09PSB0cnVlICkge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9yZXNldCB0aW1lclxuXHRcdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmF1dG9TYXZlVGltZXIpO1xuICAgICAgICAgICAgXHR0aGlzLmF1dG9TYXZlVGltZXIgPSBzZXRUaW1lb3V0KHNpdGUuYXV0b1NhdmUsIGJDb25maWcuYXV0b1NhdmVUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjc2F2ZVBhZ2UgLmJMYWJlbCcpLnRleHQoXCJTYXZlIG5vdyAoISlcIik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoIHNpdGUuYWN0aXZlUGFnZS5zdGF0dXMgIT09ICduZXcnICkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2Uuc3RhdHVzID0gJ2NoYW5nZWQnO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG5cdFx0XHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdFxuICAgICAgICAgICAgICAgICQoJyNzYXZlUGFnZSAuYkxhYmVsJykudGV4dChcIk5vdGhpbmcgdG8gc2F2ZVwiKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgc2l0ZS51cGRhdGVQYWdlU3RhdHVzKCcnKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHNhdmU6IGZ1bmN0aW9uKHNob3dDb25maXJtTW9kYWwpIHtcblxuICAgICAgICAgICAgcHVibGlzaGVyLnB1Ymxpc2goJ29uQmVmb3JlU2F2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2ZpcmUgY3VzdG9tIGV2ZW50XG4gICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignYmVmb3JlU2F2ZScpO1xuXG4gICAgICAgICAgICAvL2Rpc2FibGUgYnV0dG9uXG4gICAgICAgICAgICAkKFwiYSNzYXZlUGFnZVwiKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcblx0XG4gICAgICAgICAgICAvL3JlbW92ZSBvbGQgYWxlcnRzXG4gICAgICAgICAgICAkKCcjZXJyb3JNb2RhbCAubW9kYWwtYm9keSA+ICosICNzdWNjZXNzTW9kYWwgLm1vZGFsLWJvZHkgPiAqJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcblx0XG4gICAgICAgICAgICBzaXRlLnByZXBGb3JTYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNlcnZlckRhdGEgPSB7fTtcbiAgICAgICAgICAgIHNlcnZlckRhdGEucGFnZXMgPSB0aGlzLnNpdGVQYWdlc1JlYWR5Rm9yU2VydmVyO1xuICAgICAgICAgICAgaWYoIHRoaXMucGFnZXNUb0RlbGV0ZS5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgIHNlcnZlckRhdGEudG9EZWxldGUgPSB0aGlzLnBhZ2VzVG9EZWxldGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlcnZlckRhdGEuc2l0ZURhdGEgPSB0aGlzLmRhdGE7XG5cbiAgICAgICAgICAgIC8vc3RvcmUgY3VycmVudCByZXNwb25zaXZlIG1vZGUgYXMgd2VsbFxuICAgICAgICAgICAgc2VydmVyRGF0YS5zaXRlRGF0YS5yZXNwb25zaXZlTW9kZSA9IGJ1aWxkZXJVSS5jdXJyZW50UmVzcG9uc2l2ZU1vZGU7XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wic2l0ZXMvc2F2ZVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBzZXJ2ZXJEYXRhLFxuICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXMpe1xuXHRcbiAgICAgICAgICAgICAgICAvL2VuYWJsZSBidXR0b25cbiAgICAgICAgICAgICAgICAkKFwiYSNzYXZlUGFnZVwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcblx0XG4gICAgICAgICAgICAgICAgaWYoIHJlcy5yZXNwb25zZUNvZGUgPT09IDAgKSB7XG5cdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgaWYoIHNob3dDb25maXJtTW9kYWwgKSB7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2Vycm9yTW9kYWwgLm1vZGFsLWJvZHknKS5hcHBlbmQoICQocmVzLnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNlcnJvck1vZGFsJykubW9kYWwoJ3Nob3cnKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIH1cblx0XHRcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJlcy5yZXNwb25zZUNvZGUgPT09IDEgKSB7XG5cdFx0XG4gICAgICAgICAgICAgICAgICAgIGlmKCBzaG93Q29uZmlybU1vZGFsICkge1xuXHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3NNb2RhbCAubW9kYWwtYm9keScpLmFwcGVuZCggJChyZXMucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3NNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICB9XG5cdFx0XHRcblx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAvL25vIG1vcmUgcGVuZGluZyBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXMoZmFsc2UpO1xuXHRcdFx0XG5cbiAgICAgICAgICAgICAgICAgICAgLy91cGRhdGUgcmV2aXNpb25zP1xuICAgICAgICAgICAgICAgICAgICAkKCdib2R5JykudHJpZ2dlcignY2hhbmdlUGFnZScpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHByZXBzIHRoZSBzaXRlIGRhdGEgYmVmb3JlIHNlbmRpbmcgaXQgdG8gdGhlIHNlcnZlclxuICAgICAgICAqL1xuICAgICAgICBwcmVwRm9yU2F2ZTogZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNSZWFkeUZvclNlcnZlciA9IHt9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggdGVtcGxhdGUgKSB7Ly9zYXZpbmcgdGVtcGxhdGUsIG9ubHkgdGhlIGFjdGl2ZVBhZ2UgaXMgbmVlZGVkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNSZWFkeUZvclNlcnZlclt0aGlzLmFjdGl2ZVBhZ2UubmFtZV0gPSB0aGlzLmFjdGl2ZVBhZ2UucHJlcEZvclNhdmUoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UuZnVsbFBhZ2UoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7Ly9yZWd1bGFyIHNhdmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZmluZCB0aGUgcGFnZXMgd2hpY2ggbmVlZCB0byBiZSBzZW5kIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuc2l0ZVBhZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHRoaXMuc2l0ZVBhZ2VzW2ldLnN0YXR1cyAhPT0gJycgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzUmVhZHlGb3JTZXJ2ZXJbdGhpcy5zaXRlUGFnZXNbaV0ubmFtZV0gPSB0aGlzLnNpdGVQYWdlc1tpXS5wcmVwRm9yU2F2ZSgpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBzZXRzIGEgcGFnZSBhcyB0aGUgYWN0aXZlIG9uZVxuICAgICAgICAqL1xuICAgICAgICBzZXRBY3RpdmU6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9yZWZlcmVuY2UgdG8gdGhlIGFjdGl2ZSBwYWdlXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2hpZGUgb3RoZXIgcGFnZXNcbiAgICAgICAgICAgIGZvcih2YXIgaSBpbiB0aGlzLnNpdGVQYWdlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2l0ZVBhZ2VzW2ldLnBhcmVudFVMLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGlzcGxheSBhY3RpdmUgb25lXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVBhZ2UucGFyZW50VUwuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgZGUtYWN0aXZlIGFsbCBwYWdlIG1lbnUgaXRlbXNcbiAgICAgICAgKi9cbiAgICAgICAgZGVBY3RpdmF0ZUFsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlcyA9IHRoaXMucGFnZXNNZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgcGFnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgcGFnZXNbaV0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgYWRkcyBhIG5ldyBwYWdlIHRvIHRoZSBzaXRlXG4gICAgICAgICovXG4gICAgICAgIG5ld1BhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLmRlQWN0aXZhdGVBbGwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9jcmVhdGUgdGhlIG5ldyBwYWdlIGluc3RhbmNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWdlRGF0YSA9IFtdO1xuICAgICAgICAgICAgdmFyIHRlbXAgPSB7XG4gICAgICAgICAgICAgICAgcGFnZXNfaWQ6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwYWdlRGF0YVswXSA9IHRlbXA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBuZXdQYWdlTmFtZSA9ICdwYWdlJysoc2l0ZS5zaXRlUGFnZXMubGVuZ3RoKzEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbmV3UGFnZSA9IG5ldyBQYWdlKG5ld1BhZ2VOYW1lLCBwYWdlRGF0YSwgc2l0ZS5zaXRlUGFnZXMubGVuZ3RoKzEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdQYWdlLnN0YXR1cyA9ICduZXcnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdQYWdlLnNlbGVjdFBhZ2UoKTtcbiAgICAgICAgICAgIG5ld1BhZ2UuZWRpdFBhZ2VOYW1lKCk7XG4gICAgICAgIFxuICAgICAgICAgICAgbmV3UGFnZS5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUuc2V0UGVuZGluZ0NoYW5nZXModHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgY2hlY2tzIGlmIHRoZSBuYW1lIG9mIGEgcGFnZSBpcyBhbGxvd2VkXG4gICAgICAgICovXG4gICAgICAgIGNoZWNrUGFnZU5hbWU6IGZ1bmN0aW9uKHBhZ2VOYW1lKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFrZSBzdXJlIHRoZSBuYW1lIGlzIHVuaXF1ZVxuICAgICAgICAgICAgZm9yKCB2YXIgaSBpbiB0aGlzLnNpdGVQYWdlcyApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5zaXRlUGFnZXNbaV0ubmFtZSA9PT0gcGFnZU5hbWUgJiYgdGhpcy5hY3RpdmVQYWdlICE9PSB0aGlzLnNpdGVQYWdlc1tpXSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdlTmFtZUVycm9yID0gXCJUaGUgcGFnZSBuYW1lIG11c3QgYmUgdW5pcXVlLlwiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICByZW1vdmVzIHVuYWxsb3dlZCBjaGFyYWN0ZXJzIGZyb20gdGhlIHBhZ2UgbmFtZVxuICAgICAgICAqL1xuICAgICAgICBwcmVwUGFnZU5hbWU6IGZ1bmN0aW9uKHBhZ2VOYW1lKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhZ2VOYW1lID0gcGFnZU5hbWUucmVwbGFjZSgnICcsICcnKTtcbiAgICAgICAgICAgIHBhZ2VOYW1lID0gcGFnZU5hbWUucmVwbGFjZSgvWz8qIS58JiM7JCVAXCI8PigpKyxdL2csIFwiXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcGFnZU5hbWU7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgc2F2ZSBwYWdlIHNldHRpbmdzIGZvciB0aGUgY3VycmVudCBwYWdlXG4gICAgICAgICovXG4gICAgICAgIHVwZGF0ZVBhZ2VTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MudGl0bGUgPSBzaXRlLmlucHV0UGFnZVNldHRpbmdzVGl0bGUudmFsdWU7XG4gICAgICAgICAgICBzaXRlLmFjdGl2ZVBhZ2UucGFnZVNldHRpbmdzLm1ldGFfZGVzY3JpcHRpb24gPSBzaXRlLmlucHV0UGFnZVNldHRpbmdzTWV0YURlc2NyaXB0aW9uLnZhbHVlO1xuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnBhZ2VTZXR0aW5ncy5tZXRhX2tleXdvcmRzID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc01ldGFLZXl3b3Jkcy52YWx1ZTtcbiAgICAgICAgICAgIHNpdGUuYWN0aXZlUGFnZS5wYWdlU2V0dGluZ3MuaGVhZGVyX2luY2x1ZGVzID0gc2l0ZS5pbnB1dFBhZ2VTZXR0aW5nc0luY2x1ZGVzLnZhbHVlO1xuICAgICAgICAgICAgc2l0ZS5hY3RpdmVQYWdlLnBhZ2VTZXR0aW5ncy5wYWdlX2NzcyA9IHNpdGUuaW5wdXRQYWdlU2V0dGluZ3NQYWdlQ3NzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzaXRlLnNldFBlbmRpbmdDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHNpdGUubW9kYWxQYWdlU2V0dGluZ3MpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlIHBhZ2Ugc3RhdHVzZXNcbiAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlUGFnZVN0YXR1czogZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgaW4gdGhpcy5zaXRlUGFnZXMgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaXRlUGFnZXNbaV0uc3RhdHVzID0gc3RhdHVzOyAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKlxuICAgICAgICAgICAgQ2hlY2tzIGFsbCB0aGUgYmxvY2tzIGluIHRoaXMgc2l0ZSBoYXZlIGZpbmlzaGVkIGxvYWRpbmdcbiAgICAgICAgKi9cbiAgICAgICAgbG9hZGVkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciBpO1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuc2l0ZVBhZ2VzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5zaXRlUGFnZXNbaV0ubG9hZGVkKCkgKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBNYWtlIGV2ZXJ5IGJsb2NrIGhhdmUgYW4gb3ZlcmxheSBkdXJpbmcgZHJhZ2dpbmcgdG8gcHJldmVudCBtb3VzZSBldmVudCBpc3N1ZXNcbiAgICAgICAgKi9cbiAgICAgICAgbW92ZU1vZGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gICAgICAgICAgICB2YXIgaTtcblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLmFjdGl2ZVBhZ2UuYmxvY2tzLmxlbmd0aDsgaSsrICkge1xuXG4gICAgICAgICAgICAgICAgaWYgKCB2YWx1ZSA9PT0gJ29uJyApIHRoaXMuYWN0aXZlUGFnZS5ibG9ja3NbaV0uZnJhbWVDb3Zlci5jbGFzc0xpc3QuYWRkKCdtb3ZlJyk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIHZhbHVlID09PSAnb2ZmJyApIHRoaXMuYWN0aXZlUGFnZS5ibG9ja3NbaV0uZnJhbWVDb3Zlci5jbGFzc0xpc3QucmVtb3ZlKCdtb3ZlJyk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgXG4gICAgfTtcblxuICAgIGJ1aWxkZXJVSS5pbml0KCk7IHNpdGUuaW5pdCgpO1xuXG4gICAgXG4gICAgLy8qKioqIEVYUE9SVFNcbiAgICBtb2R1bGUuZXhwb3J0cy5zaXRlID0gc2l0ZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5idWlsZGVyVUkgPSBidWlsZGVyVUk7XG5cbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLnBhZ2VDb250YWluZXIgPSBcIiNwYWdlXCI7XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMuZWRpdGFibGVJdGVtcyA9IHtcbiAgICAgICAgJ3NwYW4uZmEnOiBbJ2NvbG9yJywgJ2ZvbnQtc2l6ZSddLFxuICAgICAgICAnLmJnLmJnMSc6IFsnYmFja2dyb3VuZC1jb2xvciddLFxuICAgICAgICAnbmF2IGEnOiBbJ2NvbG9yJywgJ2ZvbnQtd2VpZ2h0JywgJ3RleHQtdHJhbnNmb3JtJ10sXG4gICAgICAgICdpbWcnOiBbJ2JvcmRlci10b3AtbGVmdC1yYWRpdXMnLCAnYm9yZGVyLXRvcC1yaWdodC1yYWRpdXMnLCAnYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1cycsICdib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1cycsICdib3JkZXItY29sb3InLCAnYm9yZGVyLXN0eWxlJywgJ2JvcmRlci13aWR0aCddLFxuICAgICAgICAnaHIuZGFzaGVkJzogWydib3JkZXItY29sb3InLCAnYm9yZGVyLXdpZHRoJ10sXG4gICAgICAgICcuZGl2aWRlciA+IHNwYW4nOiBbJ2NvbG9yJywgJ2ZvbnQtc2l6ZSddLFxuICAgICAgICAnaHIuc2hhZG93RG93bic6IFsnbWFyZ2luLXRvcCcsICdtYXJnaW4tYm90dG9tJ10sXG4gICAgICAgICcuZm9vdGVyIGEnOiBbJ2NvbG9yJ10sXG4gICAgICAgICcuc29jaWFsIGEnOiBbJ2NvbG9yJ10sXG4gICAgICAgICcuYmcuYmcxLCAuYmcuYmcyLCAuaGVhZGVyMTAsIC5oZWFkZXIxMSc6IFsnYmFja2dyb3VuZC1pbWFnZScsICdiYWNrZ3JvdW5kLWNvbG9yJ10sXG4gICAgICAgICcuZnJhbWVDb3Zlcic6IFtdLFxuICAgICAgICAnLmVkaXRDb250ZW50JzogWydjb250ZW50JywgJ2NvbG9yJywgJ2ZvbnQtc2l6ZScsICdiYWNrZ3JvdW5kLWNvbG9yJywgJ2ZvbnQtZmFtaWx5J10sXG4gICAgICAgICdhLmJ0biwgYnV0dG9uLmJ0bic6IFsnYm9yZGVyLXJhZGl1cycsICdmb250LXNpemUnLCAnYmFja2dyb3VuZC1jb2xvciddLFxuICAgICAgICAnI3ByaWNpbmdfdGFibGUyIC5wcmljaW5nMiAuYm90dG9tIGxpJzogWydjb250ZW50J11cbiAgICB9O1xuICAgIFxuICAgIG1vZHVsZS5leHBvcnRzLmVkaXRhYmxlSXRlbU9wdGlvbnMgPSB7XG4gICAgICAgICduYXYgYSA6IGZvbnQtd2VpZ2h0JzogWyc0MDAnLCAnNzAwJ10sXG4gICAgICAgICdhLmJ0biA6IGJvcmRlci1yYWRpdXMnOiBbJzBweCcsICc0cHgnLCAnMTBweCddLFxuICAgICAgICAnaW1nIDogYm9yZGVyLXN0eWxlJzogWydub25lJywgJ2RvdHRlZCcsICdkYXNoZWQnLCAnc29saWQnXSxcbiAgICAgICAgJ2ltZyA6IGJvcmRlci13aWR0aCc6IFsnMXB4JywgJzJweCcsICczcHgnLCAnNHB4J10sXG4gICAgICAgICdoMSwgaDIsIGgzLCBoNCwgaDUsIHAgOiBmb250LWZhbWlseSc6IFsnZGVmYXVsdCcsICdMYXRvJywgJ0hlbHZldGljYScsICdBcmlhbCcsICdUaW1lcyBOZXcgUm9tYW4nXSxcbiAgICAgICAgJ2gyIDogZm9udC1mYW1pbHknOiBbJ2RlZmF1bHQnLCAnTGF0bycsICdIZWx2ZXRpY2EnLCAnQXJpYWwnLCAnVGltZXMgTmV3IFJvbWFuJ10sXG4gICAgICAgICdoMyA6IGZvbnQtZmFtaWx5JzogWydkZWZhdWx0JywgJ0xhdG8nLCAnSGVsdmV0aWNhJywgJ0FyaWFsJywgJ1RpbWVzIE5ldyBSb21hbiddLFxuICAgICAgICAncCA6IGZvbnQtZmFtaWx5JzogWydkZWZhdWx0JywgJ0xhdG8nLCAnSGVsdmV0aWNhJywgJ0FyaWFsJywgJ1RpbWVzIE5ldyBSb21hbiddXG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzLnJlc3BvbnNpdmVNb2RlcyA9IHtcbiAgICAgICAgZGVza3RvcDogJzk3JScsXG4gICAgICAgIG1vYmlsZTogJzQ4MHB4JyxcbiAgICAgICAgdGFibGV0OiAnMTAyNHB4J1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0cy5lZGl0YWJsZUNvbnRlbnQgPSBbJy5lZGl0Q29udGVudCcsICcubmF2YmFyIGEnLCAnYnV0dG9uJywgJ2EuYnRuJywgJy5mb290ZXIgYTpub3QoLmZhKScsICcudGFibGVXcmFwcGVyJywgJ2gxJywgJ2gyJ107XG5cbiAgICBtb2R1bGUuZXhwb3J0cy5hdXRvU2F2ZVRpbWVvdXQgPSAzMDAwMDA7XG4gICAgXG4gICAgbW9kdWxlLmV4cG9ydHMuc291cmNlQ29kZUVkaXRTeW50YXhEZWxheSA9IDEwMDAwO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMubWVkaXVtQ3NzVXJscyA9IFtcbiAgICAgICAgJy8vY2RuLmpzZGVsaXZyLm5ldC9tZWRpdW0tZWRpdG9yL2xhdGVzdC9jc3MvbWVkaXVtLWVkaXRvci5taW4uY3NzJyxcbiAgICAgICAgJy9jc3MvbWVkaXVtLWJvb3RzdHJhcC5jc3MnXG4gICAgXTtcbiAgICBtb2R1bGUuZXhwb3J0cy5tZWRpdW1CdXR0b25zID0gWydib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnYW5jaG9yJywgJ29yZGVyZWRsaXN0JywgJ3Vub3JkZXJlZGxpc3QnLCAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAncmVtb3ZlRm9ybWF0J107XG5cbiAgICBtb2R1bGUuZXhwb3J0cy5leHRlcm5hbEpTID0gW1xuICAgICAgICAnanMvYnVpbGRlcl9pbl9ibG9jay5qcydcbiAgICBdO1xuICAgICAgICAgICAgICAgICAgICBcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGJDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZy5qcycpO1xuXHR2YXIgc2l0ZUJ1aWxkZXIgPSByZXF1aXJlKCcuL2J1aWxkZXIuanMnKTtcblx0dmFyIGFwcFVJID0gcmVxdWlyZSgnLi91aS5qcycpLmFwcFVJO1xuXG5cdHZhciBwdWJsaXNoID0ge1xuICAgICAgICBcbiAgICAgICAgYnV0dG9uUHVibGlzaDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3B1Ymxpc2hQYWdlJyksXG4gICAgICAgIGJ1dHRvblNhdmVQZW5kaW5nQmVmb3JlUHVibGlzaGluZzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1dHRvblNhdmVQZW5kaW5nQmVmb3JlUHVibGlzaGluZycpLFxuICAgICAgICBwdWJsaXNoTW9kYWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwdWJsaXNoTW9kYWwnKSxcbiAgICAgICAgYnV0dG9uUHVibGlzaFN1Ym1pdDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3B1Ymxpc2hTdWJtaXQnKSxcbiAgICAgICAgcHVibGlzaEFjdGl2ZTogMCxcbiAgICAgICAgdGhlSXRlbToge30sXG4gICAgICAgIG1vZGFsU2l0ZVNldHRpbmdzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2l0ZVNldHRpbmdzJyksXG4gICAgXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5idXR0b25QdWJsaXNoKS5vbignY2xpY2snLCB0aGlzLmxvYWRQdWJsaXNoTW9kYWwpO1xuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblNhdmVQZW5kaW5nQmVmb3JlUHVibGlzaGluZykub24oJ2NsaWNrJywgdGhpcy5zYXZlQmVmb3JlUHVibGlzaGluZyk7XG4gICAgICAgICAgICAkKHRoaXMucHVibGlzaE1vZGFsKS5vbignY2hhbmdlJywgJ2lucHV0W3R5cGU9Y2hlY2tib3hdJywgdGhpcy5wdWJsaXNoQ2hlY2tib3hFdmVudCk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uUHVibGlzaFN1Ym1pdCkub24oJ2NsaWNrJywgdGhpcy5wdWJsaXNoU2l0ZSk7XG4gICAgICAgICAgICAkKHRoaXMubW9kYWxTaXRlU2V0dGluZ3MpLm9uKCdjbGljaycsICcjc2l0ZVNldHRpbmdzQnJvd3NlRlRQQnV0dG9uLCAubGluaycsIHRoaXMuYnJvd3NlRlRQKTtcbiAgICAgICAgICAgICQodGhpcy5tb2RhbFNpdGVTZXR0aW5ncykub24oJ2NsaWNrJywgJyNmdHBMaXN0SXRlbXMgLmNsb3NlJywgdGhpcy5jbG9zZUZ0cEJyb3dzZXIpO1xuICAgICAgICAgICAgJCh0aGlzLm1vZGFsU2l0ZVNldHRpbmdzKS5vbignY2xpY2snLCAnI3NpdGVTZXR0aW5nc1Rlc3RGVFAnLCB0aGlzLnRlc3RGVFBDb25uZWN0aW9uKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9zaG93IHRoZSBwdWJsaXNoIGJ1dHRvblxuICAgICAgICAgICAgJCh0aGlzLmJ1dHRvblB1Ymxpc2gpLnNob3coKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9saXN0ZW4gdG8gc2l0ZSBzZXR0aW5ncyBsb2FkIGV2ZW50XG4gICAgICAgICAgICAkKCdib2R5Jykub24oJ3NpdGVTZXR0aW5nc0xvYWQnLCB0aGlzLnNob3dQdWJsaXNoU2V0dGluZ3MpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL3B1Ymxpc2ggaGFzaD9cbiAgICAgICAgICAgIGlmKCB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gXCIjcHVibGlzaFwiICkge1xuICAgICAgICAgICAgICAgICQodGhpcy5idXR0b25QdWJsaXNoKS5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBoZWFkZXIgdG9vbHRpcHNcbiAgICAgICAgICAgIC8vaWYoIHRoaXMuYnV0dG9uUHVibGlzaC5oYXNBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJykgJiYgdGhpcy5idXR0b25QdWJsaXNoLmdldEF0dHJpYnV0ZSgnZGF0YS10b2dnbGUnKSA9PSAndG9vbHRpcCcgKSB7XG4gICAgICAgICAgICAvLyAgICQodGhpcy5idXR0b25QdWJsaXNoKS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgICAgICAvLyAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXskKHRoaXMuYnV0dG9uUHVibGlzaCkudG9vbHRpcCgnaGlkZScpfSwgNTAwMCk7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBsb2FkcyB0aGUgcHVibGlzaCBtb2RhbFxuICAgICAgICAqL1xuICAgICAgICBsb2FkUHVibGlzaE1vZGFsOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIHB1Ymxpc2gucHVibGlzaEFjdGl2ZSA9PT0gMCApIHsvL2NoZWNrIGlmIHdlJ3JlIGN1cnJlbnRseSBwdWJsaXNoaW5nIGFueXRoaW5nXG5cdFx0XG4gICAgICAgICAgICAgICAgLy9oaWRlIGFsZXJ0c1xuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWFsZXJ0cyA+IConKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYm9keSA+IC5hbGVydC1zdWNjZXNzJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vaGlkZSBsb2FkZXJzXG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbF9hc3NldHMgLnB1Ymxpc2hpbmcnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy53b3JraW5nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5kb25lJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vcmVtb3ZlIHB1Ymxpc2hlZCBjbGFzcyBmcm9tIGFzc2V0IGNoZWNrYm94ZXNcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsX2Fzc2V0cyBpbnB1dCcpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygncHVibGlzaGVkJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9kbyB3ZSBoYXZlIHBlbmRpbmcgY2hhbmdlcz9cbiAgICAgICAgICAgICAgICBpZiggc2l0ZUJ1aWxkZXIuc2l0ZS5wZW5kaW5nQ2hhbmdlcyA9PT0gdHJ1ZSApIHsvL3dlJ3ZlIGdvdCBjaGFuZ2VzLCBzYXZlIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsICNwdWJsaXNoUGVuZGluZ0NoYW5nZXNNZXNzYWdlJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1ib2R5LWNvbnRlbnQnKS5oaWRlKCk7XG5cdFx0XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsvL2FsbCBzZXQsIGdldCBvbiBpdCB3aXRoIHB1Ymxpc2hpbmdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBjb3JyZWN0IHBhZ2VzIGluIHRoZSBQYWdlcyBzZWN0aW9uIG9mIHRoZSBwdWJsaXNoIG1vZGFsXG4gICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWxfcGFnZXMgdGJvZHkgPiAqJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3BhZ2VzIGxpOnZpc2libGUnKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aGVQYWdlID0gJCh0aGlzKS5maW5kKCdhOmZpcnN0JykudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZVJvdyA9ICQoJzx0cj48dGQgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiIHN0eWxlPVwid2lkdGg6IDMwcHg7XCI+PGxhYmVsIGNsYXNzPVwiY2hlY2tib3ggbm8tbGFiZWxcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCInK3RoZVBhZ2UrJ1wiIGlkPVwiXCIgZGF0YS10eXBlPVwicGFnZVwiIG5hbWU9XCJwYWdlc1tdXCIgZGF0YS10b2dnbGU9XCJjaGVja2JveFwiPjwvbGFiZWw+PC90ZD48dGQ+Jyt0aGVQYWdlKyc8c3BhbiBjbGFzcz1cInB1Ymxpc2hpbmdcIj48c3BhbiBjbGFzcz1cIndvcmtpbmdcIj5QdWJsaXNoaW5nLi4uIDxpbWcgc3JjPVwiJythcHBVSS5iYXNlVXJsKydpbWFnZXMvcHVibGlzaExvYWRlci5naWZcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJkb25lIHRleHQtcHJpbWFyeVwiPlB1Ymxpc2hlZCAmbmJzcDs8c3BhbiBjbGFzcz1cImZ1aS1jaGVja1wiPjwvc3Bhbj48L3NwYW4+PC9zcGFuPjwvdGQ+PC90cj4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9jaGVja2JveGlmeVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUm93LmZpbmQoJ2lucHV0JykucmFkaW9jaGVjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlUm93LmZpbmQoJ2lucHV0Jykub24oJ2NoZWNrIHVuY2hlY2sgdG9nZ2xlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJ3RyJylbJCh0aGlzKS5wcm9wKCdjaGVja2VkJykgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oJ3NlbGVjdGVkLXJvdycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWxfcGFnZXMgdGJvZHknKS5hcHBlbmQoIHRoZVJvdyApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsICNwdWJsaXNoUGVuZGluZ0NoYW5nZXNNZXNzYWdlJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1ib2R5LWNvbnRlbnQnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2VuYWJsZS9kaXNhYmxlIHB1Ymxpc2ggYnV0dG9uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBhY3RpdmF0ZUJ1dHRvbiA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIGlucHV0W3R5cGU9Y2hlY2tib3hdJykuZWFjaChmdW5jdGlvbigpe1xuXHRcdFx0XG4gICAgICAgICAgICAgICAgaWYoICQodGhpcykucHJvcCgnY2hlY2tlZCcpICkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZUJ1dHRvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIGFjdGl2YXRlQnV0dG9uICkge1xuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIHNhdmVzIHBlbmRpbmcgY2hhbmdlcyBiZWZvcmUgcHVibGlzaGluZ1xuICAgICAgICAqL1xuICAgICAgICBzYXZlQmVmb3JlUHVibGlzaGluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgI3B1Ymxpc2hQZW5kaW5nQ2hhbmdlc01lc3NhZ2UnKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5sb2FkZXInKS5zaG93KCk7XG4gICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICBzaXRlQnVpbGRlci5zaXRlLnByZXBGb3JTYXZlKGZhbHNlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHNlcnZlckRhdGEgPSB7fTtcbiAgICAgICAgICAgIHNlcnZlckRhdGEucGFnZXMgPSBzaXRlQnVpbGRlci5zaXRlLnNpdGVQYWdlc1JlYWR5Rm9yU2VydmVyO1xuICAgICAgICAgICAgaWYoIHNpdGVCdWlsZGVyLnNpdGUucGFnZXNUb0RlbGV0ZS5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgICAgIHNlcnZlckRhdGEudG9EZWxldGUgPSBzaXRlQnVpbGRlci5zaXRlLnBhZ2VzVG9EZWxldGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLnNpdGVEYXRhID0gc2l0ZUJ1aWxkZXIuc2l0ZS5kYXRhO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL3NhdmUvMVwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgICBkYXRhOiBzZXJ2ZXJEYXRhLFxuICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXMpe1x0XHRcdFxuXHRcdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubG9hZGVyJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoICQocmVzLnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vc2VsZi1kZXN0cnVjdCBzdWNjZXNzIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXskKCcjcHVibGlzaE1vZGFsIC5tb2RhbC1hbGVydHMgLmFsZXJ0LXN1Y2Nlc3MnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXskKHRoaXMpLnJlbW92ZSgpO30pO30sIDI1MDApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgI3B1Ymxpc2hQZW5kaW5nQ2hhbmdlc01lc3NhZ2UgLmJ0bi5zYXZlJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgIGlmKCByZXMucmVzcG9uc2VDb2RlID09PSAxICkgey8vY2hhbmdlcyB3ZXJlIHNhdmVkIHdpdGhvdXQgaXNzdWVzXG5cbiAgICAgICAgICAgICAgICAgICAgLy9ubyBtb3JlIHBlbmRpbmcgY2hhbmdlc1xuICAgICAgICAgICAgICAgICAgICBzaXRlQnVpbGRlci5zaXRlLnNldFBlbmRpbmdDaGFuZ2VzKGZhbHNlKTtcblx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIC8vZ2V0IHRoZSBjb3JyZWN0IHBhZ2VzIGluIHRoZSBQYWdlcyBzZWN0aW9uIG9mIHRoZSBwdWJsaXNoIG1vZGFsXG4gICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWxfcGFnZXMgdGJvZHkgPiAqJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnI3BhZ2VzIGxpOnZpc2libGUnKS5lYWNoKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZVBhZ2UgPSAkKHRoaXMpLmZpbmQoJ2E6Zmlyc3QnKS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhlUm93ID0gJCgnPHRyPjx0ZCBjbGFzcz1cInRleHQtY2VudGVyXCIgc3R5bGU9XCJ3aWR0aDogMHB4O1wiPjxsYWJlbCBjbGFzcz1cImNoZWNrYm94XCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPVwiJyt0aGVQYWdlKydcIiBpZD1cIlwiIGRhdGEtdHlwZT1cInBhZ2VcIiBuYW1lPVwicGFnZXNbXVwiIGRhdGEtdG9nZ2xlPVwiY2hlY2tib3hcIj48L2xhYmVsPjwvdGQ+PHRkPicrdGhlUGFnZSsnPHNwYW4gY2xhc3M9XCJwdWJsaXNoaW5nXCI+PHNwYW4gY2xhc3M9XCJ3b3JraW5nXCI+UHVibGlzaGluZy4uLiA8aW1nIHNyYz1cIicrYXBwVUkuYmFzZVVybCsnaW1hZ2VzL3B1Ymxpc2hMb2FkZXIuZ2lmXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwiZG9uZSB0ZXh0LXByaW1hcnlcIj5QdWJsaXNoZWQgJm5ic3A7PHNwYW4gY2xhc3M9XCJmdWktY2hlY2tcIj48L3NwYW4+PC9zcGFuPjwvc3Bhbj48L3RkPjwvdHI+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY2hlY2tib3hpZnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVJvdy5maW5kKCdpbnB1dCcpLnJhZGlvY2hlY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoZVJvdy5maW5kKCdpbnB1dCcpLm9uKCdjaGVjayB1bmNoZWNrIHRvZ2dsZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jbG9zZXN0KCd0cicpWyQodGhpcykucHJvcCgnY2hlY2tlZCcpID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKCdzZWxlY3RlZC1yb3cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjcHVibGlzaE1vZGFsX3BhZ2VzIHRib2R5JykuYXBwZW5kKCB0aGVSb3cgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9zaG93IGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYm9keS1jb250ZW50JykuZmFkZUluKDUwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBldmVudCBoYW5kbGVyIGZvciB0aGUgY2hlY2tib3hlcyBpbnNpZGUgdGhlIHB1Ymxpc2ggbW9kYWxcbiAgICAgICAgKi9cbiAgICAgICAgcHVibGlzaENoZWNrYm94RXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYWN0aXZhdGVCdXR0b24gPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCBpbnB1dFt0eXBlPWNoZWNrYm94XScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS5wcm9wKCdjaGVja2VkJykgKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlQnV0dG9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCBhY3RpdmF0ZUJ1dHRvbiApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkKCcjcHVibGlzaFN1Ym1pdCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBwdWJsaXNoZXMgdGhlIHNlbGVjdGVkIGl0ZW1zXG4gICAgICAgICovXG4gICAgICAgIHB1Ymxpc2hTaXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy90cmFjayB0aGUgcHVibGlzaGluZyBzdGF0ZVxuICAgICAgICAgICAgcHVibGlzaC5wdWJsaXNoQWN0aXZlID0gMTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9kaXNhYmxlIGJ1dHRvblxuICAgICAgICAgICAgJCgnI3B1Ymxpc2hTdWJtaXQsICNwdWJsaXNoQ2FuY2VsJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG5cdFx0XG4gICAgICAgICAgICAvL3JlbW92ZSBleGlzdGluZyBhbGVydHNcbiAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWFsZXJ0cyA+IConKS5yZW1vdmUoKTtcblx0XHRcbiAgICAgICAgICAgIC8vcHJlcGFyZSBzdHVmZlxuICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCBmb3JtIGlucHV0W3R5cGU9XCJoaWRkZW5cIl0ucGFnZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL2xvb3AgdGhyb3VnaCBhbGwgcGFnZXNcbiAgICAgICAgICAgICQoJyNwYWdlTGlzdCA+IHVsJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vZXhwb3J0IHRoaXMgcGFnZT9cbiAgICAgICAgICAgICAgICBpZiggJCgnI3B1Ymxpc2hNb2RhbCAjcHVibGlzaE1vZGFsX3BhZ2VzIGlucHV0OmVxKCcrKCQodGhpcykuaW5kZXgoKSsxKSsnKScpLnByb3AoJ2NoZWNrZWQnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZ3JhYiB0aGUgc2tlbGV0b24gbWFya3VwXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdEb2NNYWluUGFyZW50ID0gJCgnaWZyYW1lI3NrZWxldG9uJykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vZW1wdHkgb3V0IHRoZSBza2VsZXRvblxuICAgICAgICAgICAgICAgICAgICBuZXdEb2NNYWluUGFyZW50LmZpbmQoJyonKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vbG9vcCB0aHJvdWdoIHBhZ2UgaWZyYW1lcyBhbmQgZ3JhYiB0aGUgYm9keSBzdHVmZlxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJ2lmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHIgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc2FuZGJveCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGhlQ29udGVudHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXR0ciAhPT0gdHlwZW9mIHVuZGVmaW5lZCAmJiBhdHRyICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZUNvbnRlbnRzID0gJCgnI3NhbmRib3hlcyAjJythdHRyKS5jb250ZW50cygpLmZpbmQoIGJDb25maWcucGFnZUNvbnRhaW5lciApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVDb250ZW50cyA9ICQodGhpcykuY29udGVudHMoKS5maW5kKCBiQ29uZmlnLnBhZ2VDb250YWluZXIgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgnLmZyYW1lQ292ZXInKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JlbW92ZSBpbmxpbmUgc3R5bGluZyBsZWZ0b3ZlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciggdmFyIGtleSBpbiBiQ29uZmlnLmVkaXRhYmxlSXRlbXMgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlQ29udGVudHMuZmluZCgga2V5ICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVBdHRyKCdkYXRhLXNlbGVjdG9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggJCh0aGlzKS5hdHRyKCdzdHlsZScpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHRcblx0XHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYkNvbmZpZy5lZGl0YWJsZUNvbnRlbnQubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5lZGl0YWJsZUNvbnRlbnRbaV0gKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQXR0cignZGF0YS1zZWxlY3RvcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b0FkZCA9IHRoZUNvbnRlbnRzLmh0bWwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9ncmFiIHNjcmlwdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdHMgPSAkKHRoaXMpLmNvbnRlbnRzKCkuZmluZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyICkuZmluZCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKCBzY3JpcHRzLnNpemUoKSA+IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRoZUlmcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2tlbGV0b25cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0cy5lYWNoKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCAkKHRoaXMpLnRleHQoKSAhPT0gJycgKSB7Ly9zY3JpcHQgdGFncyB3aXRoIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0ID0gdGhlSWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQuaW5uZXJIVE1MID0gJCh0aGlzKS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyLnN1YnN0cmluZygxKSApLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoICQodGhpcykuYXR0cignc3JjJykgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdCA9IHRoZUlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVJZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggYkNvbmZpZy5wYWdlQ29udGFpbmVyLnN1YnN0cmluZygxKSApLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdEb2NNYWluUGFyZW50LmFwcGVuZCggJCh0b0FkZCkgKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0lucHV0ID0gJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBjbGFzcz1cInBhZ2VcIiBuYW1lPVwieHBhZ2VzWycrJCgnI3BhZ2VzIGxpOmVxKCcrKCQodGhpcykuaW5kZXgoKSsxKSsnKSBhOmZpcnN0JykudGV4dCgpKyddXCIgdmFsdWU9XCJcIj4nKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoTW9kYWwgZm9ybScpLnByZXBlbmQoIG5ld0lucHV0ICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBuZXdJbnB1dC52YWwoIFwiPGh0bWw+XCIrJCgnaWZyYW1lI3NrZWxldG9uJykuY29udGVudHMoKS5maW5kKCdodG1sJykuaHRtbCgpK1wiPC9odG1sPlwiICk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVibGlzaC5wdWJsaXNoQXNzZXQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgcHVibGlzaEFzc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRvUHVibGlzaCA9ICQoJyNwdWJsaXNoTW9kYWxfYXNzZXRzIGlucHV0W3R5cGU9Y2hlY2tib3hdOmNoZWNrZWQ6bm90KC5wdWJsaXNoZWQsIC50b2dnbGVBbGwpLCAjcHVibGlzaE1vZGFsX3BhZ2VzIGlucHV0W3R5cGU9Y2hlY2tib3hdOmNoZWNrZWQ6bm90KC5wdWJsaXNoZWQsIC50b2dnbGVBbGwpJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCB0b1B1Ymxpc2guc2l6ZSgpID4gMCApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwdWJsaXNoLnRoZUl0ZW0gPSB0b1B1Ymxpc2guZmlyc3QoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL2Rpc3BsYXkgdGhlIGFzc2V0IGxvYWRlclxuICAgICAgICAgICAgICAgIHB1Ymxpc2gudGhlSXRlbS5jbG9zZXN0KCd0ZCcpLm5leHQoKS5maW5kKCcucHVibGlzaGluZycpLmZhZGVJbig1MDApO1xuXG4gICAgICAgICAgICAgICAgdmFyIHRoZURhdGE7XG5cdFx0XG4gICAgICAgICAgICAgICAgaWYoIHB1Ymxpc2gudGhlSXRlbS5hdHRyKCdkYXRhLXR5cGUnKSA9PT0gJ3BhZ2UnICkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdGhlRGF0YSA9IHtzaXRlSUQ6ICQoJ2Zvcm0jcHVibGlzaEZvcm0gaW5wdXRbbmFtZT1zaXRlSURdJykudmFsKCksIGl0ZW06IHB1Ymxpc2gudGhlSXRlbS52YWwoKSwgcGFnZUNvbnRlbnQ6ICQoJ2Zvcm0jcHVibGlzaEZvcm0gaW5wdXRbbmFtZT1cInhwYWdlc1snK3B1Ymxpc2gudGhlSXRlbS52YWwoKSsnXVwiXScpLnZhbCgpfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHB1Ymxpc2gudGhlSXRlbS5hdHRyKCdkYXRhLXR5cGUnKSA9PT0gJ2Fzc2V0JyApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHRoZURhdGEgPSB7c2l0ZUlEOiAkKCdmb3JtI3B1Ymxpc2hGb3JtIGlucHV0W25hbWU9c2l0ZUlEXScpLnZhbCgpLCBpdGVtOiBwdWJsaXNoLnRoZUl0ZW0udmFsKCl9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICQoJ2Zvcm0jcHVibGlzaEZvcm0nKS5hdHRyKCdhY3Rpb24nKStcIi9cIitwdWJsaXNoLnRoZUl0ZW0uYXR0cignZGF0YS10eXBlJyksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGhlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmV0KXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZmF0YWwgZXJyb3IsIHB1Ymxpc2hpbmcgd2lsbCBzdG9wXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaGlkZSBpbmRpY2F0b3JzXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWJsaXNoLnRoZUl0ZW0uY2xvc2VzdCgndGQnKS5uZXh0KCkuZmluZCgnLndvcmtpbmcnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vZW5hYmxlIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0LCAjcHVibGlzaENhbmNlbCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYWxlcnRzJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9ubyBpc3N1ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zaG93IGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2gudGhlSXRlbS5jbG9zZXN0KCd0ZCcpLm5leHQoKS5maW5kKCcud29ya2luZycpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1Ymxpc2gudGhlSXRlbS5jbG9zZXN0KCd0ZCcpLm5leHQoKS5maW5kKCcuZG9uZScpLmZhZGVJbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaC50aGVJdGVtLmFkZENsYXNzKCdwdWJsaXNoZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVibGlzaC5wdWJsaXNoQXNzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvL3B1Ymxpc2hpbmcgaXMgZG9uZVxuICAgICAgICAgICAgICAgIHB1Ymxpc2gucHVibGlzaEFjdGl2ZSA9IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9lbmFibGUgYnV0dG9uc1xuICAgICAgICAgICAgICAgICQoJyNwdWJsaXNoU3VibWl0LCAjcHVibGlzaENhbmNlbCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuXHRcdFxuICAgICAgICAgICAgICAgIC8vc2hvdyBtZXNzYWdlXG4gICAgICAgICAgICAgICAgJCgnI3B1Ymxpc2hNb2RhbCAubW9kYWwtYm9keSA+IC5hbGVydC1zdWNjZXNzJykuZmFkZUluKDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyQoJyNwdWJsaXNoTW9kYWwgLm1vZGFsLWJvZHkgPiAuYWxlcnQtc3VjY2VzcycpLmZhZGVPdXQoNTAwKTt9LCAyNTAwKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBzaG93UHVibGlzaFNldHRpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI3NpdGVTZXR0aW5nc1B1Ymxpc2hpbmcnKS5zaG93KCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGJyb3dzZSB0aGUgRlRQIGNvbm5lY3Rpb25cbiAgICAgICAgKi9cbiAgICAgICAgYnJvd3NlRlRQOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vZ290IGFsbCB3ZSBuZWVkP1xuICAgIFx0XHRcbiAgICBcdFx0aWYoICQoJyNzaXRlU2V0dGluZ3NfZnRwU2VydmVyJykudmFsKCkgPT09ICcnIHx8ICQoJyNzaXRlU2V0dGluZ3NfZnRwVXNlcicpLnZhbCgpID09PSAnJyB8fCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhc3N3b3JkJykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2UgbWFrZSBzdXJlIGFsbCBGVFAgY29ubmVjdGlvbiBkZXRhaWxzIGFyZSBwcmVzZW50Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgIFx0XHRcbiAgICAgICAgICAgIC8vY2hlY2sgaWYgdGhpcyBpcyBhIGRlZXBlciBsZXZlbCBsaW5rXG4gICAgXHRcdGlmKCAkKHRoaXMpLmhhc0NsYXNzKCdsaW5rJykgKSB7XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0aWYoICQodGhpcykuaGFzQ2xhc3MoJ2JhY2snKSApIHtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3NfZnRwUGF0aCcpLnZhbCggJCh0aGlzKS5hdHRyKCdocmVmJykgKTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHR9IGVsc2Uge1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0Ly9pZiBzbywgd2UnbGwgY2hhbmdlIHRoZSBwYXRoIGJlZm9yZSBjb25uZWN0aW5nXG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHRpZiggJCgnI3NpdGVTZXR0aW5nc19mdHBQYXRoJykudmFsKCkuc3Vic3RyKCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhdGgnKS52YWwubGVuZ3RoIC0gMSApID09PSAnLycgKSB7Ly9wcmVwZW5kIFwiL1wiXG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5nc19mdHBQYXRoJykudmFsKCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhdGgnKS52YWwoKSskKHRoaXMpLmF0dHIoJ2hyZWYnKSApO1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0fSBlbHNlIHtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzX2Z0cFBhdGgnKS52YWwoICQoJyNzaXRlU2V0dGluZ3NfZnRwUGF0aCcpLnZhbCgpK1wiL1wiKyQodGhpcykuYXR0cignaHJlZicpICk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdH1cbiAgICBcdFx0XHRcbiAgICBcdFx0XHR9XG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XG4gICAgXHRcdH1cbiAgICBcdFx0XG4gICAgXHRcdC8vZGVzdHJveSBhbGwgYWxlcnRzXG4gICAgXHRcdFxuICAgIFx0XHQkKCcjZnRwQWxlcnRzIC5hbGVydCcpLmZhZGVPdXQoNTAwLCBmdW5jdGlvbigpe1xuICAgIFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG4gICAgXHRcdH0pO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9kaXNhYmxlIGJ1dHRvblxuICAgIFx0XHQkKHRoaXMpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9yZW1vdmUgZXhpc3RpbmcgbGlua3NcbiAgICBcdFx0JCgnI2Z0cExpc3RJdGVtcyA+IConKS5yZW1vdmUoKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vc2hvdyBmdHAgc2VjdGlvblxuICAgIFx0XHQkKCcjZnRwQnJvd3NlIC5sb2FkZXJGdHAnKS5zaG93KCk7XG4gICAgXHRcdCQoJyNmdHBCcm93c2UnKS5zbGlkZURvd24oNTAwKTtcblxuICAgIFx0XHR2YXIgdGhlQnV0dG9uID0gJCh0aGlzKTtcbiAgICBcdFx0XG4gICAgXHRcdCQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhcHBVSS5zaXRlVXJsK1wiZnRwY29ubmVjdGlvbi9jb25uZWN0XCIsXG4gICAgXHRcdFx0dHlwZTogJ3Bvc3QnLFxuICAgIFx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG4gICAgXHRcdFx0ZGF0YTogJCgnZm9ybSNzaXRlU2V0dGluZ3NGb3JtJykuc2VyaWFsaXplQXJyYXkoKVxuICAgIFx0XHR9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgXHRcdFxuICAgIFx0XHRcdC8vZW5hYmxlIGJ1dHRvblxuICAgIFx0XHRcdHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHQvL2hpZGUgbG9hZGluZ1xuICAgIFx0XHRcdCQoJyNmdHBCcm93c2UgLmxvYWRlckZ0cCcpLmhpZGUoKTtcbiAgICBcdFx0XG4gICAgXHRcdFx0aWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDAgKSB7Ly9lcnJvclxuICAgIFx0XHRcdFx0JCgnI2Z0cEFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgIFx0XHRcdH0gZWxzZSBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL2FsbCBnb29kXG4gICAgXHRcdFx0XHQkKCcjZnRwTGlzdEl0ZW1zJykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgaGlkZXMvY2xvc2VzIHRoZSBGVFAgYnJvd3NlclxuICAgICAgICAqL1xuICAgICAgICBjbG9zZUZ0cEJyb3dzZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFx0XHQkKHRoaXMpLmNsb3Nlc3QoJyNmdHBCcm93c2UnKS5zbGlkZVVwKDUwMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgLypcbiAgICAgICAgICAgIHRlc3RzIHRoZSBGVFAgY29ubmVjdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBkZXRhaWxzXG4gICAgICAgICovXG4gICAgICAgIHRlc3RGVFBDb25uZWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9nb3QgYWxsIHdlIG5lZWQ/XG4gICAgXHRcdGlmKCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFNlcnZlcicpLnZhbCgpID09PSAnJyB8fCAkKCcjc2l0ZVNldHRpbmdzX2Z0cFVzZXInKS52YWwoKSA9PT0gJycgfHwgJCgnI3NpdGVTZXR0aW5nc19mdHBQYXNzd29yZCcpLnZhbCgpID09PSAnJyApIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnUGxlYXNlIG1ha2Ugc3VyZSBhbGwgRlRQIGNvbm5lY3Rpb24gZGV0YWlscyBhcmUgcHJlc2VudCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICBcdFx0XG4gICAgXHRcdC8vZGVzdHJveSBhbGwgYWxlcnRzXG4gICAgICAgICAgICAkKCcjZnRwVGVzdEFsZXJ0cyAuYWxlcnQnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgXHRcdFxuICAgIFx0XHQvL2Rpc2FibGUgYnV0dG9uXG4gICAgXHRcdCQodGhpcykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgXHRcdFxuICAgIFx0XHQvL3Nob3cgbG9hZGluZyBpbmRpY2F0b3JcbiAgICBcdFx0JCh0aGlzKS5uZXh0KCkuZmFkZUluKDUwMCk7XG4gICAgXHRcdFxuICAgICAgICAgICAgdmFyIHRoZUJ1dHRvbiA9ICQodGhpcyk7XG4gICAgXHRcdFxuICAgIFx0XHQkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcImZ0cGNvbm5lY3Rpb24vdGVzdFwiLFxuICAgIFx0XHRcdHR5cGU6ICdwb3N0JyxcbiAgICBcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuICAgIFx0XHRcdGRhdGE6ICQoJ2Zvcm0jc2l0ZVNldHRpbmdzRm9ybScpLnNlcmlhbGl6ZUFycmF5KClcbiAgICBcdFx0fSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgIFx0XHQgICAgXHRcdFxuICAgIFx0XHRcdC8vZW5hYmxlIGJ1dHRvblxuICAgIFx0XHRcdHRoZUJ1dHRvbi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB0aGVCdXR0b24ubmV4dCgpLmZhZGVPdXQoNTAwKTtcbiAgICBcdFx0XHQgICAgXHRcdFxuICAgIFx0XHRcdGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgJCgnI2Z0cFRlc3RBbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgZ29vZFxuICAgICAgICAgICAgICAgICAgICAkKCcjZnRwVGVzdEFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICBwdWJsaXNoLmluaXQoKTtcblxufSgpKTsiLCIoZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYXBwVUkgPSByZXF1aXJlKCcuL3VpLmpzJykuYXBwVUk7XG5cblx0dmFyIHNpdGVzID0ge1xuICAgICAgICBcbiAgICAgICAgd3JhcHBlclNpdGVzOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2l0ZXMnKSxcbiAgICAgICAgc2VsZWN0VXNlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJEcm9wRG93bicpLFxuICAgICAgICBzZWxlY3RTb3J0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc29ydERyb3BEb3duJyksXG4gICAgICAgIGJ1dHRvbkRlbGV0ZVNpdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWxldGVTaXRlQnV0dG9uJyksXG5cdFx0YnV0dG9uc0RlbGV0ZVNpdGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZWxldGVTaXRlQnV0dG9uJyksXG4gICAgICAgIFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5jcmVhdGVUaHVtYm5haWxzKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy5zZWxlY3RVc2VyKS5vbignY2hhbmdlJywgdGhpcy5maWx0ZXJVc2VyKTtcbiAgICAgICAgICAgICQodGhpcy5zZWxlY3RTb3J0KS5vbignY2hhbmdlJywgdGhpcy5jaGFuZ2VTb3J0aW5nKTtcbiAgICAgICAgICAgICQodGhpcy5idXR0b25zRGVsZXRlU2l0ZSkub24oJ2NsaWNrJywgdGhpcy5kZWxldGVTaXRlKTtcblx0XHRcdCQodGhpcy5idXR0b25EZWxldGVTaXRlKS5vbignY2xpY2snLCB0aGlzLmRlbGV0ZVNpdGUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGFwcGxpZXMgem9vbWVyIHRvIGNyZWF0ZSB0aGUgaWZyYW1lIHRodWJtbmFpbHNcbiAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVGh1bWJuYWlsczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcy53cmFwcGVyU2l0ZXMpLmZpbmQoJ2lmcmFtZScpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdGhlSGVpZ2h0ID0gJCh0aGlzKS5hdHRyKCdkYXRhLWhlaWdodCcpKjAuMjU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS56b29tZXIoe1xuICAgICAgICAgICAgICAgICAgICB6b29tOiAwLjI1LFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICQodGhpcykucGFyZW50KCkud2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVVSTDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL1wiKyQodGhpcykuYXR0cignZGF0YS1zaXRlaWQnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLnNpdGUnKS5maW5kKCcuem9vbWVyLWNvdmVyID4gYScpLmF0dHIoJ3RhcmdldCcsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBmaWx0ZXJzIHRoZSBzaXRlIGxpc3QgYnkgc2VsZWN0ZWQgdXNlclxuICAgICAgICAqL1xuICAgICAgICBmaWx0ZXJVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoICQodGhpcykudmFsKCkgPT09ICdBbGwnIHx8ICQodGhpcykudmFsKCkgPT09ICcnICkge1xuICAgICAgICAgICAgICAgICQoJyNzaXRlcyAuc2l0ZScpLmhpZGUoKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI3NpdGVzIC5zaXRlJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICQoJyNzaXRlcycpLmZpbmQoJ1tkYXRhLW5hbWU9XCInKyQodGhpcykudmFsKCkrJ1wiXScpLmZhZGVJbig1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGNobmFnZXMgdGhlIHNvcnRpbmcgb24gdGhlIHNpdGUgbGlzdFxuICAgICAgICAqL1xuICAgICAgICBjaGFuZ2VTb3J0aW5nOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIHNpdGVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiggJCh0aGlzKS52YWwoKSA9PT0gJ05vT2ZQYWdlcycgKSB7XG5cdFx0XG5cdFx0XHRcdHNpdGVzID0gJCgnI3NpdGVzIC5zaXRlJyk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuc29ydCggZnVuY3Rpb24oYSxiKXtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBhbiA9IGEuZ2V0QXR0cmlidXRlKCdkYXRhLXBhZ2VzJyk7XG5cdFx0XHRcdFx0dmFyIGJuID0gYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGFnZXMnKTtcblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPiBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0XHRpZihhbiA8IGJuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0XG5cdFx0XHRcdH0gKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5kZXRhY2goKS5hcHBlbmRUbyggJCgnI3NpdGVzJykgKTtcblx0XHRcblx0XHRcdH0gZWxzZSBpZiggJCh0aGlzKS52YWwoKSA9PT0gJ0NyZWF0aW9uRGF0ZScgKSB7XG5cdFx0XG5cdFx0XHRcdHNpdGVzID0gJCgnI3NpdGVzIC5zaXRlJyk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuc29ydCggZnVuY3Rpb24oYSxiKXtcblx0XHRcdFxuXHRcdFx0XHRcdHZhciBhbiA9IGEuZ2V0QXR0cmlidXRlKCdkYXRhLWNyZWF0ZWQnKS5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcblx0XHRcdFx0XHR2YXIgYm4gPSBiLmdldEF0dHJpYnV0ZSgnZGF0YS1jcmVhdGVkJykucmVwbGFjZShcIi1cIiwgXCJcIik7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuID4gYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPCBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdFx0cmV0dXJuIDA7XG5cdFx0XHRcdFxuXHRcdFx0XHR9ICk7XG5cdFx0XHRcblx0XHRcdFx0c2l0ZXMuZGV0YWNoKCkuYXBwZW5kVG8oICQoJyNzaXRlcycpICk7XG5cdFx0XG5cdFx0XHR9IGVsc2UgaWYoICQodGhpcykudmFsKCkgPT09ICdMYXN0VXBkYXRlJyApIHtcblx0XHRcblx0XHRcdFx0c2l0ZXMgPSAkKCcjc2l0ZXMgLnNpdGUnKTtcblx0XHRcdFxuXHRcdFx0XHRzaXRlcy5zb3J0KCBmdW5jdGlvbihhLGIpe1xuXHRcdFx0XG5cdFx0XHRcdFx0dmFyIGFuID0gYS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXBkYXRlJykucmVwbGFjZShcIi1cIiwgXCJcIik7XG5cdFx0XHRcdFx0dmFyIGJuID0gYi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXBkYXRlJykucmVwbGFjZShcIi1cIiwgXCJcIik7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKGFuID4gYm4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdFx0aWYoYW4gPCBibikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0XHRcblx0XHRcdFx0fSApO1xuXHRcdFx0XG5cdFx0XHRcdHNpdGVzLmRldGFjaCgpLmFwcGVuZFRvKCAkKCcjc2l0ZXMnKSApO1xuXHRcdFxuXHRcdFx0fVxuICAgICAgICAgICAgXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLypcbiAgICAgICAgICAgIGRlbGV0ZXMgYSBzaXRlXG4gICAgICAgICovXG4gICAgICAgIGRlbGV0ZVNpdGU6IGZ1bmN0aW9uKGUpIHtcblx0XHRcdCAgICAgICAgICAgIFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5tb2RhbC1jb250ZW50IHAnKS5zaG93KCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vcmVtb3ZlIG9sZCBhbGVydHNcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWFsZXJ0cyA+IConKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLmxvYWRlcicpLmhpZGUoKTtcblx0XHRcbiAgICAgICAgICAgIHZhciB0b0RlbCA9ICQodGhpcykuY2xvc2VzdCgnLnNpdGUnKTtcbiAgICAgICAgICAgIHZhciBkZWxCdXR0b24gPSAkKHRoaXMpO1xuICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgYnV0dG9uI2RlbGV0ZVNpdGVCdXR0b24nKS5zaG93KCk7XG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIGJ1dHRvbiNkZWxldGVTaXRlQnV0dG9uJykudW5iaW5kKCdjbGljaycpLmNsaWNrKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5sb2FkZXInKS5mYWRlSW4oNTAwKTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL3RyYXNoL1wiK2RlbEJ1dHRvbi5hdHRyKCdkYXRhLXNpdGVpZCcpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKHJldCl7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGVsZXRlU2l0ZU1vZGFsIC5sb2FkZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgYnV0dG9uI2RlbGV0ZVNpdGVCdXR0b24nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDAgKSB7Ly9lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWNvbnRlbnQgcCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgZ29vZFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWNvbnRlbnQgcCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZWxldGVTaXRlTW9kYWwgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggJChyZXQucmVzcG9uc2VIVE1MKSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RlbGV0ZVNpdGVNb2RhbCBidXR0b24jZGVsZXRlU2l0ZUJ1dHRvbicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0b0RlbC5mYWRlT3V0KDgwMCwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1x0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG4gICAgXG4gICAgc2l0ZXMuaW5pdCgpO1xuXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBhcHBVSSA9IHJlcXVpcmUoJy4vdWkuanMnKS5hcHBVSTtcblxuXHR2YXIgc2l0ZVNldHRpbmdzID0ge1xuICAgICAgICBcbiAgICAgICAgLy9idXR0b25TaXRlU2V0dGluZ3M6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaXRlU2V0dGluZ3NCdXR0b24nKSxcblx0XHRidXR0b25TaXRlU2V0dGluZ3MyOiAkKCcuc2l0ZVNldHRpbmdzTW9kYWxCdXR0b24nKSxcbiAgICAgICAgYnV0dG9uU2F2ZVNpdGVTZXR0aW5nczogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKSxcbiAgICBcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vJCh0aGlzLmJ1dHRvblNpdGVTZXR0aW5ncykub24oJ2NsaWNrJywgdGhpcy5zaXRlU2V0dGluZ3NNb2RhbCk7XG5cdFx0XHR0aGlzLmJ1dHRvblNpdGVTZXR0aW5nczIub24oJ2NsaWNrJywgdGhpcy5zaXRlU2V0dGluZ3NNb2RhbCk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uU2F2ZVNpdGVTZXR0aW5ncykub24oJ2NsaWNrJywgdGhpcy5zYXZlU2l0ZVNldHRpbmdzKTtcbiAgICAgICAgXG4gICAgICAgIH0sXG4gICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBsb2FkcyB0aGUgc2l0ZSBzZXR0aW5ncyBkYXRhXG4gICAgICAgICovXG4gICAgICAgIHNpdGVTZXR0aW5nc01vZGFsOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBcdFx0XG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MnKS5tb2RhbCgnc2hvdycpO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9kZXN0cm95IGFsbCBhbGVydHNcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncyAuYWxlcnQnKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XG4gICAgXHRcdFx0JCh0aGlzKS5yZW1vdmUoKTtcbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9zZXQgdGhlIHNpdGVJRFxuICAgIFx0XHQkKCdpbnB1dCNzaXRlSUQnKS52YWwoICQodGhpcykuYXR0cignZGF0YS1zaXRlaWQnKSApO1xuICAgIFx0XHRcbiAgICBcdFx0Ly9kZXN0cm95IGN1cnJlbnQgZm9ybXNcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50ID4gKicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICBcdFx0XHQkKHRoaXMpLnJlbW92ZSgpO1xuICAgIFx0XHR9KTtcbiAgICBcdFx0XG4gICAgICAgICAgICAvL3Nob3cgbG9hZGVyLCBoaWRlIHJlc3RcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5nc1dyYXBwZXIgLmxvYWRlcicpLnNob3coKTtcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5nc1dyYXBwZXIgPiAqOm5vdCgubG9hZGVyKScpLmhpZGUoKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vbG9hZCBzaXRlIGRhdGEgdXNpbmcgYWpheFxuICAgIFx0XHQkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYXBwVUkuc2l0ZVVybCtcInNpdGVzL3NpdGVBamF4L1wiKyQodGhpcykuYXR0cignZGF0YS1zaXRlaWQnKSxcbiAgICBcdFx0XHR0eXBlOiAncG9zdCcsXG4gICAgXHRcdFx0ZGF0YVR5cGU6ICdqc29uJ1xuICAgIFx0XHR9KS5kb25lKGZ1bmN0aW9uKHJldCl7ICAgIFx0XHRcdFxuICAgIFx0XHRcdFxuICAgIFx0XHRcdGlmKCByZXQucmVzcG9uc2VDb2RlID09PSAwICkgey8vZXJyb3JcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcdC8vaGlkZSBsb2FkZXIsIHNob3cgZXJyb3IgbWVzc2FnZVxuICAgIFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubG9hZGVyJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoICQocmV0LnJlc3BvbnNlSFRNTCkgKTtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0fSk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdC8vZGlzYWJsZSBzdWJtaXQgYnV0dG9uXG4gICAgXHRcdFx0XHQkKCcjc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFxuICAgIFx0XHRcdH0gZWxzZSBpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMSApIHsvL2FsbCB3ZWxsIDopXG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHQvL2hpZGUgbG9hZGVyLCBzaG93IGRhdGFcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubG9hZGVyJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50JykuYXBwZW5kKCAkKHJldC5yZXNwb25zZUhUTUwpICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJ2JvZHknKS50cmlnZ2VyKCdzaXRlU2V0dGluZ3NMb2FkJyk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdH0pO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHQvL2VuYWJsZSBzdWJtaXQgYnV0dG9uXG4gICAgXHRcdFx0XHQkKCcjc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XG4gICAgXHRcdFx0fVxuICAgIFx0XHRcbiAgICBcdFx0fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgc2F2ZXMgdGhlIHNpdGUgc2V0dGluZ3NcbiAgICAgICAgKi9cbiAgICAgICAgc2F2ZVNpdGVTZXR0aW5nczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vZGVzdHJveSBhbGwgYWxlcnRzXG4gICAgXHRcdCQoJyNzaXRlU2V0dGluZ3MgLmFsZXJ0JykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFxuICAgIFx0XHRcdCQodGhpcykucmVtb3ZlKCk7XG4gICAgXHRcdFxuICAgIFx0XHR9KTtcbiAgICBcdFx0XG4gICAgXHRcdC8vZGlzYWJsZSBidXR0b25cbiAgICBcdFx0JCgnI3NhdmVTaXRlU2V0dGluZ3NCdXR0b24nKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vaGlkZSBmb3JtIGRhdGFcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50ID4gKicpLmhpZGUoKTtcbiAgICBcdFx0XG4gICAgXHRcdC8vc2hvdyBsb2FkZXJcbiAgICBcdFx0JCgnI3NpdGVTZXR0aW5ncyAubG9hZGVyJykuc2hvdygpO1xuICAgIFx0XHRcbiAgICBcdFx0JC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFwcFVJLnNpdGVVcmwrXCJzaXRlcy9zaXRlQWpheFVwZGF0ZVwiLFxuICAgIFx0XHRcdHR5cGU6ICdwb3N0JyxcbiAgICBcdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuICAgIFx0XHRcdGRhdGE6ICQoJ2Zvcm0jc2l0ZVNldHRpbmdzRm9ybScpLnNlcmlhbGl6ZUFycmF5KClcbiAgICBcdFx0fSkuZG9uZShmdW5jdGlvbihyZXQpe1xuICAgIFx0XHRcbiAgICBcdFx0XHRpZiggcmV0LnJlc3BvbnNlQ29kZSA9PT0gMCApIHsvL2Vycm9yXG4gICAgXHRcdFx0XG4gICAgXHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5sb2FkZXInKS5mYWRlT3V0KDUwMCwgZnVuY3Rpb24oKXtcbiAgICBcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1hbGVydHMnKS5hcHBlbmQoIHJldC5yZXNwb25zZUhUTUwgKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vc2hvdyBmb3JtIGRhdGFcbiAgICBcdFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubW9kYWwtYm9keS1jb250ZW50ID4gKicpLnNob3coKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vZW5hYmxlIGJ1dHRvblxuICAgIFx0XHRcdFx0XHQkKCcjc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcdFx0XG4gICAgXHRcdFx0XHR9KTtcbiAgICBcdFx0XHRcbiAgICBcdFx0XHRcbiAgICBcdFx0XHR9IGVsc2UgaWYoIHJldC5yZXNwb25zZUNvZGUgPT09IDEgKSB7Ly9hbGwgaXMgd2VsbFxuICAgIFx0XHRcdFxuICAgIFx0XHRcdFx0JCgnI3NpdGVTZXR0aW5ncyAubG9hZGVyJykuZmFkZU91dCg1MDAsIGZ1bmN0aW9uKCl7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly91cGRhdGUgc2l0ZSBuYW1lIGluIHRvcCBtZW51XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlVGl0bGUnKS50ZXh0KCByZXQuc2l0ZU5hbWUgKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWFsZXJ0cycpLmFwcGVuZCggcmV0LnJlc3BvbnNlSFRNTCApO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly9oaWRlIGZvcm0gZGF0YVxuICAgIFx0XHRcdFx0XHQkKCcjc2l0ZVNldHRpbmdzIC5tb2RhbC1ib2R5LWNvbnRlbnQgPiAqJykucmVtb3ZlKCk7XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlU2V0dGluZ3MgLm1vZGFsLWJvZHktY29udGVudCcpLmFwcGVuZCggcmV0LnJlc3BvbnNlSFRNTDIgKTtcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdC8vZW5hYmxlIGJ1dHRvblxuICAgIFx0XHRcdFx0XHQkKCcjc2F2ZVNpdGVTZXR0aW5nc0J1dHRvbicpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly9pcyB0aGUgRlRQIHN0dWZmIGFsbCBnb29kP1xuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0aWYoIHJldC5mdHBPayA9PT0gMSApIHsvL3llcywgYWxsIGdvb2RcbiAgICBcdFx0XHRcdFx0XG4gICAgXHRcdFx0XHRcdFx0JCgnI3B1Ymxpc2hQYWdlJykucmVtb3ZlQXR0cignZGF0YS10b2dnbGUnKTtcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2Ugc3Bhbi50ZXh0LWRhbmdlcicpLmhpZGUoKTtcbiAgICBcdFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2UnKS50b29sdGlwKCdkZXN0cm95Jyk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHR9IGVsc2Ugey8vbm9wZSwgY2FuJ3QgdXNlIEZUUFxuICAgIFx0XHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcdCQoJyNwdWJsaXNoUGFnZScpLmF0dHIoJ2RhdGEtdG9nZ2xlJywgJ3Rvb2x0aXAnKTtcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2Ugc3Bhbi50ZXh0LWRhbmdlcicpLnNob3coKTtcbiAgICBcdFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0XHQkKCcjcHVibGlzaFBhZ2UnKS50b29sdGlwKCdzaG93Jyk7XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHR9XG4gICAgXHRcdFx0XHRcdFxuICAgIFx0XHRcdFx0XHRcbiAgICBcdFx0XHRcdFx0Ly91cGRhdGUgdGhlIHNpdGUgbmFtZSBpbiB0aGUgc21hbGwgd2luZG93XG4gICAgXHRcdFx0XHRcdCQoJyNzaXRlXycrcmV0LnNpdGVJRCsnIC53aW5kb3cgLnRvcCBiJykudGV4dCggcmV0LnNpdGVOYW1lICk7XG4gICAgXHRcdFx0XHRcbiAgICBcdFx0XHRcdH0pO1xuICAgIFx0XHRcdFxuICAgIFx0XHRcdFxuICAgIFx0XHRcdH1cbiAgICBcdFx0XG4gICAgXHRcdH0pO1xuICAgIFx0XHQgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgXG4gICAgfTtcbiAgICBcbiAgICBzaXRlU2V0dGluZ3MuaW5pdCgpO1xuXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cbi8qIGdsb2JhbHMgc2l0ZVVybDpmYWxzZSwgYmFzZVVybDpmYWxzZSAqL1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICBcbiAgICB2YXIgYXBwVUkgPSB7XG4gICAgICAgIFxuICAgICAgICBmaXJzdE1lbnVXaWR0aDogMTkwLFxuICAgICAgICBzZWNvbmRNZW51V2lkdGg6IDMwMCxcbiAgICAgICAgbG9hZGVyQW5pbWF0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJyksXG4gICAgICAgIHNlY29uZE1lbnVUcmlnZ2VyQ29udGFpbmVyczogJCgnI21lbnUgI21haW4gI2VsZW1lbnRDYXRzLCAjbWVudSAjbWFpbiAjdGVtcGxhdGVzVWwnKSxcbiAgICAgICAgc2l0ZVVybDogc2l0ZVVybCxcbiAgICAgICAgYmFzZVVybDogYmFzZVVybCxcbiAgICAgICAgXG4gICAgICAgIHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBGYWRlIHRoZSBsb2FkZXIgYW5pbWF0aW9uXG4gICAgICAgICAgICAkKGFwcFVJLmxvYWRlckFuaW1hdGlvbikuZmFkZU91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICQoJyNtZW51JykuYW5pbWF0ZSh7J2xlZnQnOiAtYXBwVUkuZmlyc3RNZW51V2lkdGh9LCAxMDAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJzXG4gICAgICAgICAgICAkKFwiLm5hdi10YWJzIGFcIikub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS50YWIoXCJzaG93XCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoXCJzZWxlY3Quc2VsZWN0XCIpLnNlbGVjdDIoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnOnJhZGlvLCA6Y2hlY2tib3gnKS5yYWRpb2NoZWNrKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvb2x0aXBzXG4gICAgICAgICAgICAkKFwiW2RhdGEtdG9nZ2xlPXRvb2x0aXBdXCIpLnRvb2x0aXAoXCJoaWRlXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJsZTogVG9nZ2xlIGFsbCBjaGVja2JveGVzXG4gICAgICAgICAgICAkKCcudGFibGUgLnRvZ2dsZS1hbGwgOmNoZWNrYm94Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgdmFyIGNoID0gJHRoaXMucHJvcCgnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgICR0aGlzLmNsb3Nlc3QoJy50YWJsZScpLmZpbmQoJ3Rib2R5IDpjaGVja2JveCcpLnJhZGlvY2hlY2soIWNoID8gJ3VuY2hlY2snIDogJ2NoZWNrJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQWRkIHN0eWxlIGNsYXNzIG5hbWUgdG8gYSB0b29sdGlwc1xuICAgICAgICAgICAgJChcIi50b29sdGlwXCIpLmFkZENsYXNzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLnByZXYoKS5hdHRyKFwiZGF0YS10b29sdGlwLXN0eWxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInRvb2x0aXAtXCIgKyAkKHRoaXMpLnByZXYoKS5hdHRyKFwiZGF0YS10b29sdGlwLXN0eWxlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKFwiLmJ0bi1ncm91cFwiKS5vbignY2xpY2snLCBcImFcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLmVuZCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZvY3VzIHN0YXRlIGZvciBhcHBlbmQvcHJlcGVuZCBpbnB1dHNcbiAgICAgICAgICAgICQoJy5pbnB1dC1ncm91cCcpLm9uKCdmb2N1cycsICcuZm9ybS1jb250cm9sJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykuY2xvc2VzdCgnLmlucHV0LWdyb3VwLCAuZm9ybS1ncm91cCcpLmFkZENsYXNzKCdmb2N1cycpO1xuICAgICAgICAgICAgfSkub24oJ2JsdXInLCAnLmZvcm0tY29udHJvbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy5pbnB1dC1ncm91cCwgLmZvcm0tZ3JvdXAnKS5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUYWJsZTogVG9nZ2xlIGFsbCBjaGVja2JveGVzXG4gICAgICAgICAgICAkKCcudGFibGUgLnRvZ2dsZS1hbGwnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2ggPSAkKHRoaXMpLmZpbmQoJzpjaGVja2JveCcpLnByb3AoJ2NoZWNrZWQnKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmNsb3Nlc3QoJy50YWJsZScpLmZpbmQoJ3Rib2R5IDpjaGVja2JveCcpLmNoZWNrYm94KCFjaCA/ICdjaGVjaycgOiAndW5jaGVjaycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRhYmxlOiBBZGQgY2xhc3Mgcm93IHNlbGVjdGVkXG4gICAgICAgICAgICAkKCcudGFibGUgdGJvZHkgOmNoZWNrYm94Jykub24oJ2NoZWNrIHVuY2hlY2sgdG9nZ2xlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgLCBjaGVjayA9ICR0aGlzLnByb3AoJ2NoZWNrZWQnKVxuICAgICAgICAgICAgICAgICwgdG9nZ2xlID0gZS50eXBlID09PSAndG9nZ2xlJ1xuICAgICAgICAgICAgICAgICwgY2hlY2tib3hlcyA9ICQoJy50YWJsZSB0Ym9keSA6Y2hlY2tib3gnKVxuICAgICAgICAgICAgICAgICwgY2hlY2tBbGwgPSBjaGVja2JveGVzLmxlbmd0aCA9PT0gY2hlY2tib3hlcy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgJHRoaXMuY2xvc2VzdCgndHInKVtjaGVjayA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnc2VsZWN0ZWQtcm93Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHRvZ2dsZSkgJHRoaXMuY2xvc2VzdCgnLnRhYmxlJykuZmluZCgnLnRvZ2dsZS1hbGwgOmNoZWNrYm94JykuY2hlY2tib3goY2hlY2tBbGwgPyAnY2hlY2snIDogJ3VuY2hlY2snKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTd2l0Y2hcbiAgICAgICAgICAgICQoXCJbZGF0YS10b2dnbGU9J3N3aXRjaCddXCIpLndyYXAoJzxkaXYgY2xhc3M9XCJzd2l0Y2hcIiAvPicpLnBhcmVudCgpLmJvb3RzdHJhcFN3aXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhcHBVSS5zZWNvbmRNZW51VHJpZ2dlckNvbnRhaW5lcnMub24oJ2NsaWNrJywgJ2E6bm90KC5idG4pJywgYXBwVUkuc2Vjb25kTWVudUFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIHNlY29uZE1lbnVBbmltYXRpb246IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICAgICAgJCgnI21lbnUgI21haW4gYScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcbiAgICAgICAgICAgIC8vc2hvdyBvbmx5IHRoZSByaWdodCBlbGVtZW50c1xuICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCB1bCBsaScpLmhpZGUoKTtcbiAgICAgICAgICAgICQoJyNtZW51ICNzZWNvbmQgdWwgbGkuJyskKHRoaXMpLmF0dHIoJ2lkJykpLnNob3coKTtcblxuICAgICAgICAgICAgaWYoICQodGhpcykuYXR0cignaWQnKSA9PT0gJ2FsbCcgKSB7XG4gICAgICAgICAgICAgICAgJCgnI21lbnUgI3NlY29uZCB1bCNlbGVtZW50cyBsaScpLnNob3coKTtcdFx0XG4gICAgICAgICAgICB9XG5cdFxuICAgICAgICAgICAgJCgnLm1lbnUgLnNlY29uZCcpLmNzcygnZGlzcGxheScsICdibG9jaycpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB3aWR0aDogYXBwVUkuc2Vjb25kTWVudVdpZHRoXG4gICAgICAgICAgICB9LCA1MDApO1x0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfTtcbiAgICBcbiAgICAvL2luaXRpYXRlIHRoZSBVSVxuICAgIGFwcFVJLnNldHVwKCk7XG5cblxuICAgIC8vKioqKiBFWFBPUlRTXG4gICAgbW9kdWxlLmV4cG9ydHMuYXBwVUkgPSBhcHBVSTtcbiAgICBcbn0oKSk7IiwiKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBcbiAgICBleHBvcnRzLmdldFJhbmRvbUFyYml0cmFyeSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG4gICAgfTtcblxuICAgIGV4cG9ydHMuZ2V0UGFyYW1ldGVyQnlOYW1lID0gZnVuY3Rpb24gKG5hbWUsIHVybCkge1xuXG4gICAgICAgIGlmICghdXJsKSB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW1xcXV0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoXCJbPyZdXCIgKyBuYW1lICsgXCIoPShbXiYjXSopfCZ8I3wkKVwiKSxcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKHVybCk7XG4gICAgICAgIGlmICghcmVzdWx0cykgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICghcmVzdWx0c1syXSkgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csIFwiIFwiKSk7XG4gICAgICAgIFxuICAgIH07XG4gICAgXG59KCkpOyIsIihmdW5jdGlvbiAoKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHJlcXVpcmUoJy4vbW9kdWxlcy91aS5qcycpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvYWNjb3VudC5qcycpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvc2l0ZXMuanMnKTtcblx0cmVxdWlyZSgnLi9tb2R1bGVzL3NpdGVzZXR0aW5ncy5qcycpO1xuXHRyZXF1aXJlKCcuL21vZHVsZXMvcHVibGlzaGluZy5qcycpO1xuXG59KCkpOyIsIi8qIVxuICogcHVibGlzaGVyLmpzIC0gKGMpIFJ5YW4gRmxvcmVuY2UgMjAxMVxuICogZ2l0aHViLmNvbS9ycGZsb3JlbmNlL3B1Ymxpc2hlci5qc1xuICogTUlUIExpY2Vuc2VcbiovXG5cbi8vIFVNRCBCb2lsZXJwbGF0ZSBcXG8vICYmIEQ6XG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpOyAvLyBub2RlXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZhY3RvcnkpOyAvLyBhbWRcbiAgfSBlbHNlIHtcbiAgICAvLyB3aW5kb3cgd2l0aCBub0NvbmZsaWN0XG4gICAgdmFyIF9wdWJsaXNoZXIgPSByb290LnB1Ymxpc2hlcjtcbiAgICB2YXIgcHVibGlzaGVyID0gcm9vdC5wdWJsaXNoZXIgPSBmYWN0b3J5KCk7XG4gICAgcm9vdC5wdWJsaXNoZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJvb3QucHVibGlzaGVyID0gX3B1Ymxpc2hlcjtcbiAgICAgIHJldHVybiBwdWJsaXNoZXI7XG4gICAgfVxuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuICB2YXIgcHVibGlzaGVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciB0b3BpY3MgPSB7fTtcbiAgICBvYmogPSBvYmogfHwge307XG5cbiAgICBvYmoucHVibGlzaCA9IGZ1bmN0aW9uICh0b3BpYy8qLCBtZXNzYWdlcy4uLiovKSB7XG4gICAgICBpZiAoIXRvcGljc1t0b3BpY10pIHJldHVybiBvYmo7XG4gICAgICB2YXIgbWVzc2FnZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRvcGljc1t0b3BpY10ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRvcGljc1t0b3BpY11baV0uaGFuZGxlci5hcHBseSh0b3BpY3NbdG9waWNdW2ldLmNvbnRleHQsIG1lc3NhZ2VzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcblxuICAgIG9iai5zdWJzY3JpYmUgPSBmdW5jdGlvbiAodG9waWNPclN1YnNjcmliZXIsIGhhbmRsZXJPclRvcGljcykge1xuICAgICAgdmFyIGZpcnN0VHlwZSA9IHR5cGVvZiB0b3BpY09yU3Vic2NyaWJlcjtcblxuICAgICAgaWYgKGZpcnN0VHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmliZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3RUeXBlID09PSAnb2JqZWN0JyAmJiAhaGFuZGxlck9yVG9waWNzKSB7XG4gICAgICAgIHJldHVybiBzdWJzY3JpYmVNdWx0aXBsZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGhhbmRsZXJPclRvcGljcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGhpdGNoLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBoaXRjaE11bHRpcGxlLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZSAodG9waWMsIGhhbmRsZXIsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZWZlcmVuY2UgPSB7IGhhbmRsZXI6IGhhbmRsZXIsIGNvbnRleHQ6IGNvbnRleHQgfHwgb2JqIH07XG4gICAgICB0b3BpYyA9IHRvcGljc1t0b3BpY10gfHwgKHRvcGljc1t0b3BpY10gPSBbXSk7XG4gICAgICB0b3BpYy5wdXNoKHJlZmVyZW5jZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhdHRhY2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0b3BpYy5wdXNoKHJlZmVyZW5jZSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG4gICAgICAgIGRldGFjaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVyYXNlKHRvcGljLCByZWZlcmVuY2UpO1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmVNdWx0aXBsZSAocGFpcnMpIHtcbiAgICAgIHZhciBzdWJzY3JpcHRpb25zID0ge307XG4gICAgICBmb3IgKHZhciB0b3BpYyBpbiBwYWlycykge1xuICAgICAgICBpZiAoIXBhaXJzLmhhc093blByb3BlcnR5KHRvcGljKSkgY29udGludWU7XG4gICAgICAgIHN1YnNjcmlwdGlvbnNbdG9waWNdID0gc3Vic2NyaWJlKHRvcGljLCBwYWlyc1t0b3BpY10pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbnM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhpdGNoIChzdWJzY3JpYmVyLCB0b3BpYykge1xuICAgICAgcmV0dXJuIHN1YnNjcmliZSh0b3BpYywgc3Vic2NyaWJlclt0b3BpY10sIHN1YnNjcmliZXIpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoaXRjaE11bHRpcGxlIChzdWJzY3JpYmVyLCB0b3BpY3MpIHtcbiAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRvcGljcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKCBoaXRjaChzdWJzY3JpYmVyLCB0b3BpY3NbaV0pICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3Vic2NyaXB0aW9ucztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZXJhc2UgKGFyciwgdmljdGltKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyBpKyspe1xuICAgICAgICBpZiAoYXJyW2ldID09PSB2aWN0aW0pIGFyci5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBwdWJsaXNoZXIgaXMgYSBwdWJsaXNoZXIsIHNvIG1ldGEgLi4uXG4gIHJldHVybiBwdWJsaXNoZXIocHVibGlzaGVyKTtcbn0pKTtcbiJdfQ==
