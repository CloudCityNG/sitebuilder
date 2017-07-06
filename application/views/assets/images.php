<?php $this->load->view("shared/header.php");?>

<body>
  	
  	<?php $this->load->view("shared/nav.php");?> 
  	
    <div class="container-fluid">
    
    	<div class="row">
    	
    		<div class="col-md-9 col-sm-8">
    		
    		    <h1><span class="fui-image"></span> <?php echo $this->lang->line('images_heading')?></h1>
    		
    		</div><!-- /.col -->
    		    	
    	</div><!-- /.row -->
    	
    	<hr class="dashed margin-bottom-50">
    	    	
    	<div class="row">
    	
    		<div class="col-md-3">
    		
    			<div class="uploadPanel">
    			
    				<div class="top">
    					
    					<span class="fui-upload"></span> &nbsp;<b><?php echo $this->lang->line('images_uploadimages')?></b>
    					
    				</div>
    				
    				<div class="bottom">
    					
    					<form action="<?php echo site_url('assets/imageUpload')?>" enctype="multipart/form-data" method="post">
    					
    						<div class="form-group">
    							<div class="fileinput fileinput-new" data-provides="fileinput">
    								<div class="fileinput-preview thumbnail" data-trigger="fileinput" style=""></div>
    								<div>
    									<span class="btn btn-primary btn-embossed btn-file">
    										<span class="fileinput-new"><span class="fui-image"></span>&nbsp;&nbsp;<?php echo $this->lang->line('images_button_selectimage')?></span>
    										<span class="fileinput-exists"><span class="fui-gear"></span>&nbsp;&nbsp;<?php echo $this->lang->line('images_button_change')?></span>
    										<input type="file" name="userFile">
    									</span>
    									<a href="#" class="btn btn-primary btn-embossed fileinput-exists" data-dismiss="fileinput"><span class="fui-trash"></span>&nbsp;&nbsp;<?php echo $this->lang->line('images_button_remove')?></a>
    								</div>
    							</div>
    						</div><!-- /.form-group -->
    						
    						<hr class="dashed">
    						
    						<button type="submit" class="btn btn-primary btn-block"><span class="fui-upload"></span> <?php echo $this->lang->line('images_button_upload')?></button>
    						
    					</form>
    				
    				</div><!-- /.bottom -->
    			
    			</div><!-- /.uploadPanel -->
    		
    		</div><!-- /.col -->
    		
    		<div class="col-md-9">
    		
    			<?php if( $this->session->flashdata('error') != '' ):?>
    			<div class="alert alert-warning">
    				<button type="button" class="close fui-cross" data-dismiss="alert"></button>
    			  	<h4><?php echo $this->lang->line('images_error_heading')?></h4>
    			  	<p>
    			  		<?php echo $this->session->flashdata('error');?>
    			  	</p>
    			</div>
    			<?php elseif( $this->session->flashdata('success') != '' ):?>
				<div class="alert alert-success">
					<button type="button" class="close fui-cross" data-dismiss="alert"></button>
				  	<h4><?php echo $this->lang->line('images_success_heading')?></h4>
				  	<p>
				  		<?php echo $this->lang->line('images_success_message')?>
				  	</p>
				</div>    			
    			<?php endif;?>
    		
    			<ul class="nav nav-tabs nav-append-content">
    				<li class="active"><a href="#myImagesTab"><?php echo $this->lang->line('images_tab_myimages')?></a></li>
  					<?php if( isset($adminImages) ):?><li><a href="#adminImagesTab" id="ie_admintab"><?php echo $this->lang->line('images_tab_otherimages')?></a></li><?php endif;?>
    			</ul> <!-- /tabs -->
    			
    			<div class="tab-content">
    			
  					<div class="tab-pane active" id="myImagesTab">
  					
  						<?php if( isset($userImages) ):?>
  						
  							<div class="images masonry-3" id="myImages">
  						
  							<?php foreach( $userImages as $img ):?>
  							<div class="image">
  								    					
  								<div class="imageWrap">
  									<a href="#"><img src="<?php echo base_url().$this->config->item('images_uploadDir');?>/<?php echo $userID;?>/<?php echo $img;?>"></a>
  								</div>
  								
  								<div class="buttons clearfix">
  									<button type="button" class="btn btn-primary btn-embossed btn-sm"><span class="fui-export"></span> <?php echo $this->lang->line('images_button_view')?></button>
  									<button type="button" class="btn btn-danger btn-embossed btn-sm" data-img="<?php echo base_url().$this->config->item('images_uploadDir');?>/<?php echo $userID;?>/<?php echo $img;?>"><span class="fui-trash"></span> <?php echo $this->lang->line('images_button_delete')?></button>
  								</div>
  							
  							</div><!-- /.image -->
  							<?php endforeach?>
  							
  							</div>
  						
  						<?php else:?>
  						
  							<!-- Alert Info -->
  							<div class="alert alert-info">
  								<button type="button" class="close fui-cross" data-dismiss="alert"></button>
  							  	<?php echo $this->lang->line('images_message_noimages')?>
  							</div>
  						
  						<?php endif;?>
   						   					
   					</div><!-- /.tab-pane -->
    			
   					<div class="tab-pane" id="adminImagesTab">
    					
    					<div class="images masonry-3" id="adminImages">
    					
    						<?php if( isset($adminImages) ):?>
    						
    							<?php foreach( $adminImages as $img ):?>
    							<div class="image">
    							    					
    								<div class="imageWrap">
    									<a href="#"><img src="<?php echo base_url().$this->config->item('images_dir');?>/<?php echo $img;?>"></a>
    									<div class="ribbon-wrapper-red"><div class="ribbon-red"><?php echo $this->lang->line('images_label_admin');?></div></div>
    								</div>
    							
    								<div class="buttons clearfix">
    									<button type="button" class="btn btn-primary btn-embossed btn-sm"><span class="fui-export"></span> view</button>
    								</div>
    						
    							</div><!-- /.image -->
    							<?php endforeach;?>
    						
    						<?php endif;?>
							    					
    					</div><!-- /.adminImages -->
    					
   					</div><!-- /.tab-pane -->
   					
  				</div> <!-- /tab-content -->
    		
    		</div><!-- /.col -->
    	
    	</div><!-- /row -->
    
    </div><!-- /.container -->
	
	
	
	<!-- modals -->
	
	<div class="modal fade viewPic" id="viewPic" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		
		<div class="modal-dialog modal-lg">
	    	
	    	<div class="modal-content">
	      		
	      		<!--<div class="modal-header">
	        		<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
	        		<h4 class="modal-title" id="myModalLabel"></h4>
	      		</div>-->
	      		      	
	      		<div class="modal-body">
	        	
	        		<img src="" id="thePic">
	        	
	      		</div><!-- /.modal-body -->
	      			      		
	      		<div class="modal-footer">
	        		<button type="button" class="btn btn-default" data-dismiss="modal"><span class="fui-cross"></span> <?php echo $this->lang->line('modal_close')?></button>
	      		</div>
	      		
	    	</div><!-- /.modal-content -->
	    	
	  	</div><!-- /.modal-dialog -->
	  	
	</div><!-- /.modal -->
	
	
	<div class="modal fade deleteImageModal" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		
		<div class="modal-dialog">
	    	
	    	<div class="modal-content">
	      		
	      		<div class="modal-header">
	        		<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only"><?php echo $this->lang->line('modal_close')?></span></button>
	        		<h4 class="modal-title" id="myModalLabel"><span class="fui-info"></span> <?php echo $this->lang->line('modal_areyousure')?></h4>
	      		</div>
	      		      	
	      		<div class="modal-body">
	        	
	        		<p>
	        			<?php echo $this->lang->line('modal_deleteimage_message')?>
	        		</p>
	        	
	      		</div><!-- /.modal-body -->
	      			      		
	      		<div class="modal-footer">
	        		<button type="button" class="btn btn-default" data-dismiss="modal"><span class="fui-cross"></span> <?php echo $this->lang->line('cancel')?></button>
	        		<button type="button" class="btn btn-primary" id="deleteImageButton"><span class="fui-check"></span> <?php echo $this->lang->line('modal_deleteimage_button_delete')?></button>
	      		</div>
	      		
	    	</div><!-- /.modal-content -->
	    	
	  	</div><!-- /.modal-dialog -->
	  	
	</div><!-- /.modal -->
	
	
	<?php $this->load->view("shared/modal_account.php");?>
		
	<!-- /modals -->	
		

    <!-- Load JS here for greater good =============================-->
    <?php if( ENVIRONMENT == 'development' ):?>
    <script src="<?php echo base_url('js/vendor/jquery.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/flat-ui-pro.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/chosen.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/jquery.zoomer.js');?>"></script>
    <script src="<?php echo base_url('js/build/images.js');?>"></script>
    <?php else:?>
    <script src="<?php echo base_url('js/build/images.min.js');?>"></script>
    <?php endif;?>

    <!--[if lt IE 10]>
    <script>
    alert('')
    $(function(){
    	var msnry1 = new Masonry( '#myImages', {
	    	// options
	    	itemSelector: '.image',
	    	"gutter": 20
	    });
	    $('#ie_admintab').on('shown.bs.tab', function(e){
	    
	    	var msnry2 = new Masonry( '#adminImages', {
	    	// options
	    	itemSelector: '.image',
	    	"gutter": 20
	    });
	    
	    })
    
    })
    </script>
    <![endif]-->
  </body>
</html>
