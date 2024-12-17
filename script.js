document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('nav .textContainer a');
  const sections = document.querySelectorAll('section');
  const logoContainer = document.querySelector('.page2 .logo');
  const navbar = document.querySelector('nav');

  function navigateToSection(targetId) {
    let targetFound = false;
    sections.forEach((section) => {
      if (section.getAttribute('id') === targetId) {
        section.classList.remove('hidden');
        targetFound = true;
      } else {
        section.classList.add('hidden');
      }
    });

    if (!targetFound) {
      console.warn(`Section with ID "${targetId}" not found.`);
    }

    if (targetId === 'section2') {
      if (logoContainer) logoContainer.classList.add('show');
    } else {
      if (logoContainer) logoContainer.classList.remove('show');
    }

    navLinks.forEach((link) => link.classList.remove('active-link'));
    const targetNavLink = document.querySelector(`nav .textContainer a[href="#${targetId}"]`);
    if (targetNavLink) {
      targetNavLink.classList.add('active-link');
    }
  }

  navigateToSection('section1');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      navigateToSection(targetId);
    });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.style.color = 'white';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.9)';
      navbar.style.color = 'black';
    }
  });

  var map = L.map('map').setView([-7.2725, 112.722], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // Force map to recalculate size after rendering
  setTimeout(() => {
    map.invalidateSize();
  }, 300);

  // Add WMS layers
  var areaLayer = L.tileLayer.wms('http://localhost:8080/geoserver/responsi/wms', {
    layers: 'responsi:area',
    format: 'image/png',
    transparent: true,
    attribution: 'Area Layer'
  }).addTo(map);

  var jalanLayer = L.tileLayer.wms('http://localhost:8080/geoserver/responsi/wms', {
    layers: 'responsi:jalan3',
    format: 'image/png',
    transparent: true,
    attribution: 'Jalan Layer'
  }).addTo(map);

  // Fetch data from data.php and add markers to the map
  fetch('data.php?format=json')
    .then(response => response.json())
    .then(data => {
      data.forEach(item => {
        L.marker([item.latitude, item.longitude])
          .addTo(map)
          .bindPopup(`<b>${item.jenis_sarana}</b><br>Latitude: ${item.latitude}<br>Longitude: ${item.longitude}`);
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  $(document).ready(function () {
    // Muat data dari data.php dalam format HTML
    function loadTable() {
      $('#data-tabel').load('data.php');
    }
  
    loadTable();
  
    // Tambah/Edit data
    $('#dataForm').on('submit', function (e) {
      e.preventDefault();
      const formData = $(this).serialize();
      $.post('data.php', formData, function (response) {
        alert(response);
        $('#dataForm')[0].reset();
        loadTable();
        $('#dataForm').hide(); // Sembunyikan form setelah data disimpan
      });
    });
  
    // Isi form edit
    $(document).on('click', '.btn-edit', function () {
      const row = $(this).closest('tr');
      const id = row.data('id');
      const jenis_sarana = row.find('td:nth-child(2)').text();
      const latitude = row.find('td:nth-child(3)').text();
      const longitude = row.find('td:nth-child(4)').text();
  
      $('#id').val(id);
      $('#jenis_sarana').val(jenis_sarana);
      $('#latitude').val(latitude);
      $('#longitude').val(longitude);
      $('#dataForm').show(); // Tampilkan form edit
    });
  
    // Show form input data saat tombol Add Data diklik
    $('#addDataBtn').on('click', function () {
      $('#dataForm')[0].reset(); // Reset form
      $('#id').val(''); // Reset hidden id
      $('#dataForm').show(); // Tampilkan form input
    });
  
    // Menghapus data
    $(document).on('click', '.btn-delete', function () {
      const row = $(this).closest('tr');
      const id = row.data('id');
      
      if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        $.post('data.php', { delete_id: id }, function (response) {
          alert(response);
          loadTable(); // Reload tabel setelah data dihapus
        });
      }
    });
  });
});
