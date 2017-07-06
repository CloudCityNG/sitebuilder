<?php

//error_reporting(E_NONE); //Setting this to E_ALL showed that that cause of not redirecting were few blank lines added in some php files.

$config_path = '../application/config/config.php';
$db_config_path = '../application/config/database.php';

// Only load the classes in case the user submitted the form
if ($_POST)
{
	// Load the classes and create the new objects
	require_once('includes/core_class.php');
	require_once('includes/database_class.php');
	require_once('includes/Bcrypt.php');
	require_once('includes/EnvatoAPI.php');

	$core = new Core();
	$database = new Database();

	// Validate the post data
	if ($core->validate_post($_POST) == true)
	{
		// Purchase key verification
		//$envatoapi = new EnvatoAPI();
		//$verify = $envatoapi->get_purchase(trim($_POST['purchase_key']));
		$verify = 'PASS';
		// First verify purchase key then, create the database, then create tables, then write config file
		if ($verify == 'FAILED')
		{
			$message = $core->show_message('error',"Wrong Purchase Key, Please verify your purchase key.");
		}
		else if ($database->create_database($_POST) == false)
		{
			$message = $core->show_message('error',"The database could not be created, please verify your settings.");
		}
		else if ($database->create_tables($_POST) == false)
		{
			$message = $core->show_message('error',"The database tables could not be created, please verify your settings.");
		}
		else if ($core->write_config($_POST) == false)
		{
			$message = $core->show_message('error',"The database configuration file could not be written, please chmod application/config/database.php file to 777");
		}

		sleep(5);

		//create admin user
		$database->create_admin($_POST, $_POST['email'], $_POST['password_admin']);

		// If no errors, redirect to registration page
		if ( ! isset($message))
		{
			$redir = ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") ? "https" : "http");
			$redir .= "://".$_SERVER['HTTP_HOST'];
			$redir .= str_replace(basename($_SERVER['SCRIPT_NAME']),"",$_SERVER['SCRIPT_NAME']);
			$redir = str_replace('install/','',$redir);
			header( 'Location: done.php') ;
		}
	}
	else
	{
		$message = $core->show_message('error','Not all fields have been filled in correctly. <b>All fields below are required to install SITEBUILDER.</b>');
	}
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8">
	<title>SITEBUILDER Installation</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- Loading Bootstrap -->
	<link href="../css/build-main.css" rel="stylesheet">

	<!-- Loading Flat UI -->
	<link href="../css/login.css" rel="stylesheet">

	<link rel="shortcut icon" href="../images/favicon.png">

	<!-- HTML5 shim, for IE6-8 support of HTML5 elements. All other JS at the end of file. -->
	<!--[if lt IE 9]>
	<script src="../js/html5shiv.js"></script>
	<script src="../js/respond.min.js"></script>
	<![endif]-->
	<style>
		body.login form .input-group .input-group-btn button.btn {
			height: 42px;
		}
		h5.smaller {
			font-size: 20px;
			margin-bottom: 20px;
		}
	</style>
</head>

<body class="login">

	<div class="container">

		<div class="row">

			<?php if( is_writable($db_config_path) && is_writable($config_path) ){?>

			<div class="col-md-4 col-md-offset-4">

				<h2 class="text-center">
					<b>SITE</b>BUILDER
				</h2>

				<?php if( isset($message) ):?>
					<div class="alert alert-danger">
						<button type="button" class="close fui-cross" data-dismiss="alert"></button>
						<?php echo $message;?>
					</div>
				<?php endif?>

				<form role="form" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">

					<h5 class="smaller"><span class="fui-gear"></span> Database Configuration</h5>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-home"></span></button>
						</span>
						<input type="text" class="form-control" id="hostname" name="hostname" value="<?php if( isset($_POST['hostname']) ){echo $_POST['hostname'];}else{echo "localhost";}?>" placeholder="Hostname">
					</div>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-user"></span></button>
						</span>
						<input type="text" class="form-control" id="username" name="username" value="<?php if( isset($_POST['username']) ){echo $_POST['username'];}?>" placeholder="Username">
					</div>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-lock"></span></button>
						</span>
						<input type="password" class="form-control" id="password" name="password" value="<?php if( isset($_POST['username']) ){echo $_POST['password'];}?>" placeholder="Password">
					</div>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-list"></span></button>
						</span>
						<input type="text" class="form-control" id="database" name="database" value="<?php if( isset($_POST['database']) ){echo $_POST['database'];}?>" placeholder="Database name">
					</div>

					<hr class="dashed light" style="margin-top: 40px; margin-bottom: 40px">

					<h5 class="smaller"><span class="fui-user"></span> Admin User Setup</h5>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-mail"></span></button>
						</span>
						<input type="text" class="form-control" id="email" name="email" value="<?php if( isset($_POST['email']) ){echo $_POST['email'];}?>" placeholder="Email address">
					</div>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-lock"></span></button>
						</span>
						<input type="password" class="form-control" id="password_admin" name="password_admin" value="<?php if( isset($_POST['password_admin']) ){echo $_POST['password_admin'];}?>" placeholder="Password">
					</div>

					<!--<hr class="dashed light" style="margin-top: 40px; margin-bottom: 40px">

					<h5 class="smaller"><span class="fui-lock"></span> Purchase code <a href="#purchaseKeyHelp" data-toggle="modal">(?)</a></h5>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-lock"></span></button>
						</span>
						<input type="text" class="form-control" id="purchase_key" name="purchase_key" value="" placeholder="Purchase Key">
					</div>-->

					<hr class="dashed light" style="margin-top: 40px; margin-bottom: 40px">

					<h5 class="smaller"><span class="fui-home"></span> URL Setup</h5>

					<div class="input-group">
						<span class="input-group-btn">
							<button class="btn"><span class="fui-home"></span></button>
						</span>
						<input type="text" class="form-control" id="base_url" name="base_url" value="<?php if( isset($_POST['base_url']) ){echo $_POST['base_url'];}else{echo "http://".$_SERVER['HTTP_HOST']."/";}?>" placeholder="Base URL">
					</div>

					<button type="submit" class="btn btn-primary btn-embossed btn-block"><span class="fui-check"></span> Install <b>SITEBUILDER</b></button>

					<br><br>

				</form>

			</div><!-- /.col-md-6 -->

			<?php } else { ?>
			<div class="col-md-10 col-md-offset-1">
				<h2 class="text-center">
					<b>SITE</b>BUILDER
				</h2>

				<div class="alert alert-danger">
					<button type="button" class="close fui-cross" data-dismiss="alert"></button>
					<p>
						Please make the application/config/config.php and application/config/database.php file writable.
						<br><strong>Example</strong>:<br /><code>chmod 777 application/config/config.php</code>
						<br><strong>Example</strong>:<br /><code>chmod 777 application/config/database.php</code>
					</p>
				</div>
			</div>
			<?php } ?>

		</div><!-- /.row -->

	</div><!-- /.container -->

	<div class="modal" id="purchaseKeyHelp">
		<div class="modal-dialog">
	    	<div class="modal-content">
	      		<div class="modal-header">
	        		<button type="button" class="close fui-cross" data-dismiss="modal" aria-hidden="true"></button>
	        		<h4 class="modal-title">Purchase code verification</h3>
	      		</div>

	      		<div class="modal-body">
	        		<p>
	        			In order to install your own version of SiteBuilder Lite, we will need to verify your purchase first. This is done by entering your purchase code.
	        		</p>
	        		<p>
	        			If you're not sure where to find your purchase code, please have a look at the following <a href="https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code-" target="_blank">Envato help article</a>.
	        		</p>
	        		<p>
	        			 If after reading the above article, you're still not sure about your purchase code, please contact our <a href="https://selfhosted.net/support/" target="_blank">help desk</a>.
	        		</p>
	      		</div>

	      		<div class="modal-footer">
	        		<a href="#" class="btn btn-default btn-wide">It’s ok</a>
	        		<a href="#" class="btn btn-primary btn-wide">Turn it off now.</a>
	      		</div>
	    	</div>
	  	</div>
	</div>

	<script src="../js/vendor/jquery.min.js"></script>
    <script src="../js/vendor/jquery-ui.min.js"></script>
    <script src="../js/vendor/flat-ui-pro.min.js"></script>
</body>
</html>