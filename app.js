const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const connectDB = require('./config/db');

const User = require('./models/User');
const Pendaftaran = require('./models/Pendaftaran');
const Admin = require('./models/Admin');
const Organisasi = require('./models/Organisasi');
const Kegiatan = require('./models/Kegiatan');
const AdminKetua = require('./models/AdminKetua');
const app = express();

connectDB();

// ================= FOLDER UPLOAD =================

if (!fs.existsSync('./public/uploads')) {

  fs.mkdirSync('./public/uploads', {
    recursive: true
  });

}

// ================= MULTER =================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, './public/uploads');

  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + '-' + file.originalname
    );

  }

});

const upload = multer({
  storage
});

// ================= VIEW ENGINE =================

app.set('view engine', 'ejs');

app.set(
  'views',
  path.join(__dirname, 'views')
);

// ================= MIDDLEWARE =================

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static('public'));

app.use(session({

  secret: 'login-register-secret',

  resave: false,

  saveUninitialized: true

}));

// ================= MIDDLEWARE LOGIN =================

function checkLogin(req, res, next) {

  if (req.session.user) {

    next();

  } else {

    res.redirect('/login');

  }

}

function checkAdmin(req, res, next) {

  if (req.session.admin) {

    next();

  } else {

    res.redirect('/login');

  }

}

function checkKetua(req, res, next) {

  if (req.session.adminKetua) {

    next();

  } else {

    res.redirect('/login-ketua');

  }

}
// ================= HALAMAN UTAMA =================

app.get('/', (req, res) => {

  res.render('index');

});

app.get('/index', (req, res) => {

  res.render('index');

});

// ================= REGISTER =================

app.get('/register', (req, res) => {

  res.render('register', {
    pesan: null
  });

});

app.post('/register', async (req, res) => {

  try {

    const {
      nama,
      email,
      password
    } = req.body;

    const cekUser =
    await User.findOne({ email });

    if (cekUser) {

      return res.render('register', {
        pesan: 'Email sudah dipakai.'
      });

    }

    await User.create({

      nama,
      email,
      password,
      foto: '/logo.png'

    });

    res.redirect('/login');

  } catch (error) {

    console.log(error);

    res.render('register', {
      pesan: 'Gagal daftar.'
    });

  }

});

// ================= LOGIN =================

app.get('/login', (req, res) => {

  res.render('login', {
    pesan: null
  });

});

app.post('/login', async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    // ================= LOGIN ADMIN =================

    const admin =
    await Admin.findOne({
      email,
      password
    });

    if (admin) {

      req.session.admin = admin;

      return res.redirect('/admin');

    }
// ================= LOGIN KETUA =================

const ketua = await AdminKetua
.findOne({
  username: email,
  password
})
.populate('organisasiId');

if (ketua) {

  req.session.adminKetua = ketua;

  return res.redirect('/ketua');

}
    // ================= LOGIN USER =================

    const user =
    await User.findOne({
      email,
      password
    });

    if (user) {

      req.session.user = user;

      return res.redirect('/dashboard');

    }

    res.render('login', {
      pesan: 'Login gagal.'
    });

  } catch (error) {

    console.log(error);

    res.render('login', {
      pesan: 'Error login.'
    });

  }

});

// ================= LOGIN KETUA =================

app.get('/login-ketua', (req, res) => {

  res.render('login-ketua', {
    pesan: null
  });

});

app.post('/login-ketua', async (req, res) => {

  try {

    const { username, password } = req.body;

    const ketua = await AdminKetua
      .findOne({ username, password })
      .populate('organisasiId');

    if (!ketua) {

      return res.render('login-ketua', {
        pesan: 'Username atau Password salah'
      });

    }

    req.session.adminKetua = ketua;

    res.redirect('/ketua');

  } catch (error) {

    console.log(error);

    res.send('Error Login Ketua');

  }

});

// ================= USER =================

// ================= DASHBOARD =================

app.get(
  '/dashboard',
  checkLogin,
  async (req, res) => {

    try {

      const dataOrganisasi =
      await Organisasi.find()
      .sort({ _id: -1 });

      res.render('dashboard', {

        user: req.session.user,
        dataOrganisasi

      });

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka dashboard'
      );

    }

  }
);

// ================= ORGANISASI =================

app.get(
  '/organisasi',
  checkLogin,
  async (req, res) => {

    try {

      const dataOrganisasi =
      await Organisasi.find()
      .sort({ _id: -1 });

      res.render('organisasi', {

        user: req.session.user,
        dataOrganisasi

      });

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka organisasi'
      );

    }

  }
);

// ================= DETAIL ORGANISASI =================

app.get(
  '/organisasi/:nama',
  checkLogin,
  async (req, res) => {

    try {

      const namaOrganisasi =
      req.params.nama;

      const organisasi =
      await Organisasi.findOne({

        nama: namaOrganisasi

      });

      const dataKegiatan =
      await Kegiatan.find({

        organisasi:
        namaOrganisasi

      }).sort({
        _id: -1
      });

      res.render(
        'detail-organisasi',
        {

          user: req.session.user,

          organisasi,

          dataKegiatan

        }
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka detail organisasi'
      );

    }

  }
);

// ================= KEGIATAN =================

app.get(
  '/kegiatan',
  checkLogin,
  async (req, res) => {

    try {

      const dataKegiatan =
      await Kegiatan.find()
      .sort({ _id: -1 });

      res.render('kegiatan', {

        user: req.session.user,

        dataKegiatan

      });

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka kegiatan'
      );

    }

  }
);

// ================= DETAIL KEGIATAN =================

app.get(
  '/kegiatan/:id',
  checkLogin,
  async (req, res) => {

    try {

      const detailKegiatan =
      await Kegiatan.findById(
        req.params.id
      );

      if (!detailKegiatan) {

        return res.send(
          'Kegiatan tidak ditemukan'
        );

      }

      res.render(
        'detail-kegiatan',
        {

          user: req.session.user,

          detailKegiatan

        }
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka detail kegiatan'
      );

    }

  }
);

// ================= PROFIL =================

app.get('/profil', checkLogin, async (req, res) => {

  try {

    const userData =
    await User.findById(
      req.session.user._id
    );

    res.render('profil', {

      user: req.session.user,

      userData

    });

  } catch (error) {

    console.log(error);

    res.send('Gagal membuka profil');

  }

});

app.get('/edit-profil', checkLogin, async (req, res) => {

  try {

    const userData =
    await User.findById(
      req.session.user._id
    );

    res.render('edit-profil', {

      user: req.session.user,

      userData

    });

  } catch (error) {

    console.log(error);

    res.send(
      'Gagal membuka edit profil'
    );

  }

});

app.post(
  '/edit-profil',
  checkLogin,
  upload.single('fotoProfil'),
  async (req, res) => {

    try {

      const {
        nama,
        email,
        password
      } = req.body;

      const dataUpdate = {

        nama,
        email,
        password

      };

      if (req.file) {

        dataUpdate.foto =
        '/uploads/' +
        req.file.filename;

      }

      const userUpdate =
      await User.findByIdAndUpdate(

        req.session.user._id,

        dataUpdate,

        { new: true }

      );

      req.session.user =
      userUpdate;

      res.redirect('/profil');

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal update profil'
      );

    }

  }
);

// ================= HAPUS FOTO =================

app.get(
  '/hapus-foto',
  checkLogin,
  async (req, res) => {

    try {

      const userUpdate =
      await User.findByIdAndUpdate(

        req.session.user._id,

        {
          foto: '/logo.png'
        },

        {
          new: true
        }

      );

      req.session.user =
      userUpdate;

      res.redirect('/edit-profil');

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal hapus foto'
      );

    }

  }
);

// ================= PENDAFTARAN =================

app.get('/pendaftaran', checkLogin, (req, res) => {

  res.render('pendaftaran', {

    user: req.session.user,

    pesan: null

  });

});

app.post('/pendaftaran', checkLogin, async (req, res) => {

  try {

    const {

      organisasi,
      alasan,
      kelas,
      jurusan

    } = req.body;

    const cek =
    await Pendaftaran.findOne({

      userId: req.session.user._id,

      status: 'pending'

    });

    if (cek) {

      return res.render(
        'pendaftaran',
        {

          user: req.session.user,

          pesan:
          'Masih ada pendaftaran yang diproses!'

        }
      );

    }

    await Pendaftaran.create({

      userId:
      req.session.user._id,

      nama:
      req.session.user.nama,

      email:
      req.session.user.email,

      kelas,
      jurusan,
      organisasi,
      alasan,

      status: 'pending'

    });

    res.render('pendaftaran', {

      user: req.session.user,

      pesan: 'Berhasil daftar!'

    });

  } catch (error) {

    console.log(error);

    res.send('Error pendaftaran');

  }

});

// ================= PENDAFTARAN SAYA =================

app.get(
  '/pendaftaran-saya',
  checkLogin,
  async (req, res) => {

    try {

      const dataPendaftaran =
      await Pendaftaran.find({

        userId:
        req.session.user._id

      }).sort({
        createdAt: -1
      });

      res.render(
        'pendaftaran-saya',
        {

          user: req.session.user,

          dataPendaftaran

        }
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal ambil data'
      );

    }

  }
);
// ================= DASHBOARD KETUA =================

app.get('/ketua', checkKetua, async (req, res) => {

  try {

    const organisasiKetua =
      req.session.adminKetua.organisasiId.nama;

    const dataPendaftaran =
  await Pendaftaran.find()
  .sort({
    createdAt: -1
  });

    res.render(
      'ketua-dashboard',
      {

        ketua:
        req.session.adminKetua,

        dataPendaftaran

      }
    );

  } catch (error) {

    console.log(error);

    res.send(
      'Gagal membuka dashboard ketua'
    );

  }

});


// ================= ADMIN DASHBOARD =================

app.get('/admin', checkAdmin, async (req, res) => {

  const totalUser =
  await User.countDocuments();

  const totalDaftar =
  await Pendaftaran.countDocuments();

  const totalOrganisasi =
  await Organisasi.countDocuments();

  const totalKegiatan =
  await Kegiatan.countDocuments();

  res.render('admin-dashboard', {

    admin: req.session.admin,

    totalUser,
    totalDaftar,
    totalOrganisasi,
    totalKegiatan

  });

});

// ================= ADMIN PENDAFTARAN =================

app.get(
  '/admin/pendaftaran',
  checkAdmin,
  async (req, res) => {

    const data =
    await Pendaftaran.find()
    .sort({ createdAt: -1 });

    res.render(
      'admin-pendaftaran',
      {

        admin: req.session.admin,

        data

      }
    );

  }
);

// ================= ADMIN USERS =================

app.get(
  '/admin/users',
  checkAdmin,
  async (req, res) => {

    const users =
    await User.find();

    res.render(
      'admin-users',
      {

        admin: req.session.admin,

        users

      }
    );

  }
);

// ================= ADMIN ORGANISASI =================

app.get(
  '/admin/organisasi',
  checkAdmin,
  async (req, res) => {

    const dataOrganisasi =
    await Organisasi.find()
    .sort({ _id: -1 });

    res.render(
      'admin-organisasi',
      {

        admin: req.session.admin,

        dataOrganisasi

      }
    );

  }
);

// ================= TAMBAH ORGANISASI =================

app.post(
  '/admin/tambah-organisasi',
  checkAdmin,
  upload.single('gambar'),
  async (req, res) => {

    try {

      const {
        nama,
        deskripsi
      } = req.body;

      let gambar = '/logo.png';

      if (req.file) {

        gambar =
        '/uploads/' +
        req.file.filename;

      }

      await Organisasi.create({

        nama,
        deskripsi,
        gambar

      });

      res.redirect(
        '/admin/organisasi'
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal tambah organisasi'
      );

    }

  }
);

// ================= HAPUS ORGANISASI =================

app.get(
  '/admin/hapus-organisasi/:id',
  checkAdmin,
  async (req, res) => {

    await Organisasi.findByIdAndDelete(
      req.params.id
    );

    res.redirect(
      '/admin/organisasi'
    );

  }
);
// ================= EDIT ORGANISASI =================

// halaman edit organisasi
app.get(
  '/admin/edit-organisasi/:id',
  checkAdmin,
  async (req, res) => {

    try {

      const organisasi =
      await Organisasi.findById(
        req.params.id
      );

      res.render(
        'edit-organisasi',
        {

          admin:
          req.session.admin,

          organisasi

        }
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka edit organisasi'
      );

    }

  }
);

// proses update organisasi
app.post(
  '/admin/update-organisasi/:id',
  checkAdmin,
  upload.single('gambar'),
  async (req, res) => {

    try {

      const {
        nama,
        deskripsi
      } = req.body;

      const dataUpdate = {

        nama,
        deskripsi

      };

      // update gambar baru
      if (req.file) {

        dataUpdate.gambar =
        '/uploads/' +
        req.file.filename;

      }

      await Organisasi.findByIdAndUpdate(

        req.params.id,

        dataUpdate

      );

      res.redirect(
        '/admin/organisasi'
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal update organisasi'
      );

    }

  }
);

// ================= ADMIN KEGIATAN =================

app.get(
  '/admin/kegiatan',
  checkAdmin,
  async (req, res) => {

    const dataKegiatan =
    await Kegiatan.find()
    .sort({ _id: -1 });

    const dataOrganisasi =
    await Organisasi.find()
    .sort({ nama: 1 });

    res.render(
      'admin-kegiatan',
      {

        admin: req.session.admin,

        dataKegiatan,

        dataOrganisasi

      }
    );

  }
);

// ================= TAMBAH KEGIATAN =================

app.post(
  '/admin/tambah-kegiatan',
  checkAdmin,
  upload.array('gambar', 10),
  async (req, res) => {

    try {

      const {

        organisasi,
        judul,
        deskripsi,
        tanggal

      } = req.body;

      let gambar = [];

      if (
        req.files &&
        req.files.length > 0
      ) {

        gambar =
        req.files.map(file =>

          '/uploads/' +
          file.filename

        );

      }

      await Kegiatan.create({

        organisasi,
        judul,
        deskripsi,
        tanggal,
        gambar

      });

      res.redirect(
        '/admin/kegiatan'
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal tambah kegiatan'
      );

    }

  }
);

// ================= EDIT KEGIATAN =================

// halaman edit kegiatan
app.get(
  '/admin/edit-kegiatan/:id',
  checkAdmin,
  async (req, res) => {

    try {

      const kegiatan =
      await Kegiatan.findById(
        req.params.id
      );

      const dataOrganisasi =
      await Organisasi.find()
      .sort({ nama: 1 });

      res.render(
        'edit-kegiatan',
        {
          admin: req.session.admin,
          kegiatan,
          dataOrganisasi
        }
      );

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal membuka edit kegiatan'
      );

    }

  }
);

// proses update kegiatan
app.post(
  '/admin/update-kegiatan/:id',
  checkAdmin,
  upload.array('gambar', 10),
  async (req, res) => {

    try {

      const {
        organisasi,
        judul,
        deskripsi,
        tanggal
      } = req.body;

      const dataUpdate = {
        organisasi,
        judul,
        deskripsi,
        tanggal
      };

      if (
        req.files &&
        req.files.length > 0
      ) {

        dataUpdate.gambar =
        req.files.map(file =>
          '/uploads/' + file.filename
        );

      }

      await Kegiatan.findByIdAndUpdate(
        req.params.id,
        dataUpdate
      );

      res.redirect('/admin/kegiatan');

    } catch (error) {

      console.log(error);

      res.send(
        'Gagal update kegiatan'
      );

    }

  }
);

// ================= HAPUS KEGIATAN =================

app.get(
  '/admin/hapus-kegiatan/:id',
  checkAdmin,
  async (req, res) => {

    await Kegiatan.findByIdAndDelete(
      req.params.id
    );

    res.redirect(
      '/admin/kegiatan'
    );

  }
);

// ================= AKSI PENDAFTARAN =================

app.get('/admin/acc/:id', checkAdmin, async (req, res) => {

  await Pendaftaran.findByIdAndUpdate(

    req.params.id,

    {
      status: 'diterima'
    }

  );

  res.redirect('/admin/pendaftaran');

});

app.get('/admin/tolak/:id', checkAdmin, async (req, res) => {

  await Pendaftaran.findByIdAndUpdate(

    req.params.id,

    {
      status: 'ditolak'
    }

  );

  res.redirect('/admin/pendaftaran');

});

app.get('/admin/hapus/:id', checkAdmin, async (req, res) => {

  await Pendaftaran.findByIdAndDelete(
    req.params.id
  );

  res.redirect('/admin/pendaftaran');

});

// ================= LOGOUT =================

app.get('/logout', (req, res) => {

  req.session.destroy(() => {

    res.redirect('/');

  });

});

// ================= SERVER =================

app.listen(3002, () => {

  console.log(
    'Server jalan di http://localhost:3002'
  );

});