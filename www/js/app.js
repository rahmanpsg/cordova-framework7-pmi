let app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'UTD PMI',
  // App id
  id: 'com.skripsi.pmi',
  theme: 'ios',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  view: {
    stackPages: true
  },
  // Add default routes
  routes: [{
    path: '/login/',
    componentUrl: './pages/login.html',
  }, {
    path: '/registrasi/',
    componentUrl: './pages/registrasi.html',
  }, {
    path: '/reset/',
    componentUrl: './pages/reset.html',
  }, {
    path: '/user/',
    componentUrl: './pages/user.html',
  }, {
    path: '/stok/:id/:nama/',
    componentUrl: './pages/stok.html',
  }, {
    path: '/permintaan/:id/:pmi/:jumlah/:gol_darah/',
    componentUrl: './pages/permintaan.html',
  }, {
    name: 'profil',
    path: '/profil/:dataProfil/',
    componentUrl: './pages/profil.html',
  }],
});

let mainView = app.views.create('.view-main');

let $$ = Dom7;

const URL = 'http://192.168.43.78/pmi-server/api/';
// const URL = 'http://utd-pmi.000webhostapp.com/api/';

formProses = new formProses(URL);

if (navigator.connection.type == 'none') {
  app.dialog.alert('Anda tidak memiliki koneksi internet', 'Informasi');
}

function cekLogin() {
  const hasLogin = localStorage.getItem('hasLogin');
  if (hasLogin == 'user') {
    mainView.router.navigate('/user/', {
      reloadAll: true
    });
  } else {
    mainView.router.navigate('/login/');
  }
}

function generateID(tabel, kode) {
  const id = formProses.createID({
    tabel,
    kode,
    panjang: 5
  });
  return id;
}

Template7.registerHelper('tanggalHelper', (date) => {
  return moment(date).format('lll');
});

Template7.registerHelper('cekTotal', (total) => {
  if (total > 0) {
    return `<div class="chip-label">${total} Kantong</div>`
  } else {
    return `<div class="chip-label">Kosong</div>`
  }
});

Template7.registerHelper('statusHelper', (status, pmi) => {
  switch (status) {
    case 'Order':
      return 'Permintaan anda sedang diproses, silahkan tunggu konfirmasi berikutnya';
      break;
    case 'Dikonfirmasi':
      return 'Permintaan anda telah dikonfirmasi, silahkan perlihatkan bukti konfirmasi ini ketika ingin mengambil darah di kantor PMI';
      break;
    case 'Ditolak':
      return `Permintaan anda ditolak oleh ${pmi}`;
      break;
    case 'Diterima':
      return '';
      break;
  }
});

Template7.registerHelper('historyHelper', (history) => {
  if (typeof history === 'object') {
    let res = [];
    for (const key in history) {
      res.push(`<p><b>Tanggal ${key}</b> : ${moment(history[key]).format('lll')}</p>`)
    }

    return res.join(' ');
  }
})

Template7.registerHelper('profilHelper', (dataProfil) => {
  if (typeof dataProfil === 'object') {
    let res = [];

    const icon = {
      nama: 'person',
      username: 'person_circle',
      telp: 'phone',
      tgl_lahir: 'calendar',
      jenis_kelamin: 'person_crop_square',
      email: 'at'
    }

    const title = {
      nama: 'Nama',
      username: 'Username',
      telp: 'Nomor Telpon',
      tgl_lahir: 'Tanggal Lahir',
      jenis_kelamin: 'Jenis Kelamin',
      email: 'Email'
    }
    for (const key in dataProfil) {
      if (key !== 'password') {
        res.push(`<li>
                    <div class="item-content">
                    <div class="item-media"><i class="icon f7-icons">${icon[key]}</i></div>
                    <div class="item-inner">
                        <div class="item-title">
                            <div class="item-header">${title[key]}</div>
                            ${dataProfil[key]}
                        </div>
                    </div>
                </div>
            </li>`);
      }
    }

    return res.join(' ');
  }
})

document.addEventListener("deviceready", onDeviceReady, false);

// cekLogin();

function onDeviceReady() {
  cekLogin();
  // NotificationHadle();
  document.addEventListener("backbutton", onBackKeyDown, false);

  if (window.StatusBar) {
    // StatusBar.overlaysWebView(true);
    // StatusBar.style(1); //Light
    StatusBar.styleLightContent();
  }
}

function NotificationHadle() {
  FirebasePlugin.onMessageReceived(function (message) {
    // alert("Message type: " + message.messageType);
    if (message.messageType === "notification") {
      // alert("Notification message received");
      let notificationFull = app.notification.create({
        icon: '<i class="icon demo-icon">7</i>',
        title: 'UTD Palang Merah Indonesia',
        titleRightText: 'sekarang',
        subtitle: message.title,
        text: message.body,
        closeTimeout: 10000,
      });

      notificationFull.open();

      if (message.tap) {
        alert("Tapped in " + message.tap);
      }
    }
    // alert(message);
  }, function (error) {
    // alert(error);
  });
}

function saveToken() {
  window.FirebasePlugin.getToken(function (token) {
    const data = {
      token
    }

    let where;

    where = {
      id: localStorage.getItem('id')
    }
    formProses.update('user', data, where)
  })
}

let opened = 0;

function exitApp() {
  if (opened > 0) {
    return false;
  } else {
    app.dialog.confirm('Anda yakin untuk menutup aplikasi?', 'Informasi',
      function () {
        navigator.app.exitApp();
      },
      function () {
        opened = 0;
        return false;
      }
    );
    opened = 1;
  }
}

function onBackKeyDown() {
  // Handle the back button
  if ($$('.modal-in').length > 0) {
    app.sheet.close('.modal-in')
  } else if (app.views.main.history.length == 1) {
    exitApp();
    e.preventDefault();
  } else {
    app.dialog.close();
    app.views.main.router.back();
    return false;
  }
}