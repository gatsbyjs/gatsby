# build headless chrome on EC2
# https://github.com/adieuadieu/serverless-chrome/blob/master/chrome/README.md

# sudo su

yum install -y git redhat-lsb python bzip2 tar pkgconfig atk-devel alsa-lib-devel bison binutils brlapi-devel bluez-libs-devel bzip2-devel cairo-devel cups-devel dbus-devel dbus-glib-devel expat-devel fontconfig-devel freetype-devel gcc-c++ GConf2-devel glib2-devel glibc.i686 gperf glib2-devel gtk2-devel gtk3-devel java-1.*.0-openjdk-devel libatomic libcap-devel libffi-devel libgcc.i686 libgnome-keyring-devel libjpeg-devel libstdc++.i686 libX11-devel libXScrnSaver-devel libXtst-devel libxkbcommon-x11-devel ncurses-compat-libs nspr-devel nss-devel pam-devel pango-devel pciutils-devel pulseaudio-libs-devel zlib.i686 httpd mod_ssl php php-cli python-psutil wdiff --enablerepo=epel

cd ~
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
echo "export PATH=$PATH:$HOME/depot_tools" >> ~/.bash_profile
source ~/.bash_profile

mkdir Chromium
cd Chromium
fetch --no-history chromium
cd src

# use /tmp instead of /dev/shm
# https://groups.google.com/a/chromium.org/forum/#!msg/headless-dev/qqbZVZ2IwEw/CPInd55OBgAJ
sed -i -e "s/use_dev_shm = true;/use_dev_shm = false;/g" base/files/file_util_posix.cc

mkdir -p out/Headless
echo 'import("//build/args/headless.gn")' > out/Headless/args.gn
echo 'is_debug = false' >> out/Headless/args.gn
echo 'symbol_level = 0' >> out/Headless/args.gn
echo 'is_component_build = false' >> out/Headless/args.gn
echo 'remove_webcore_debug_symbols = true' >> out/Headless/args.gn
echo 'enable_nacl = false' >> out/Headless/args.gn
gn gen out/Headless
ninja -C out/Headless headless_shell

cd out/Headless
tar -zcvf /home/ec2-user/headless_shell.tar.gz headless_shell 

# scp ec2-user@xxx.amazonaws.com:~/headless_shell.tar.gz .
