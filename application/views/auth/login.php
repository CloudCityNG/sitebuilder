<?php $this->load->view("shared/header.php");?>

<body class="login">

    <div class="container">

        <div class="row">

            <div class="col-md-4 col-md-offset-4">

                <div class="logo">
                    <img src="<?php echo base_url('images/logo.svg')?>" alt="SiteBuilder Lite">
                </div>

                <!--<p><?php echo lang('login_subheading');?></p>-->

                <?php if( isset($message) && $message != '' ):?>
                    <div class="alert alert-success">
                        <button data-dismiss="alert" class="close fui-cross" type="button"></button>
                        <?php echo $message;?>
                    </div>
                <?php endif;?>

                <form role="form" action="<?php echo site_url("auth/login");?>" method="post">

                    <div class="input-group">
                        <span class="input-group-btn">
                            <button class="btn"><span class="fui-user"></span></button>
                        </span>
                        <input type="email" class="form-control" id="identity" name="identity" tabindex="1" autofocus placeholder="Your email address">
                    </div>

                    <div class="input-group">
                        <span class="input-group-btn">
                            <button class="btn"><span class="fui-lock"></span></button>
                        </span>
                        <input type="password" class="form-control" id="password" name="password" tabindex="2" placeholder="Your password">
                    </div>

                    <label class="checkbox margin-bottom-20" for="checkbox1">
                        <input type="checkbox" value="1" id="remember" name="remember" tabindex="3" data-toggle="checkbox">
                        <?php echo $this->lang->line('login_rememberme')?>
                    </label>

                    <button type="submit" class="btn btn-primary btn-block btn-embossed" tabindex="4"><?php echo $this->lang->line('login_button_login')?><span class="fui-arrow-right"></span></button>

                    <div class="row">

                        <div class="col-md-12 text-center">
                            <a href="<?php echo site_url("auth/forgot_password");?>"><?php echo $this->lang->line('login_lostpassword')?></a>
                        </div>

                    </div><!-- /.row -->

                </form>

                <div class="divider">
                    <span><?php echo $this->lang->line('OR')?></span>
                </div>

                <h2 class="text-center margin-bottom-25">
                    <?php echo $this->lang->line('login_signupheading')?>
                </h2>

                <a href="<?php echo site_url("auth/create_user");?>" class="btn btn-block btn-inverse btn-embossed"><?php echo $this->lang->line('login_button_signup')?> <span class="fui-new"></span></a>

            </div><!-- /.col -->

        </div><!-- /.row -->

    </div><!-- /.container -->

    <!-- Load JS here for greater good =============================-->
    <?php if( ENVIRONMENT == 'development' ):?>
    <script src="<?php echo base_url('js/vendor/jquery.min.js');?>"></script>
    <script src="<?php echo base_url('js/vendor/flat-ui-pro.min.js');?>"></script>
    <?php else:?>
    <script src="<?php echo base_url('js/build/login.min.js');?>"></script>
    <?php endif;?>
</body>
</html>