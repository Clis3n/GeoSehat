<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db_name = 'responsi';

// Membuat koneksi
$conn = new mysqli($host, $user, $pass, $db_name);

// Periksa koneksi
if ($conn->connect_error) {
    die('Koneksi Gagal: ' . $conn->connect_error);
}

// Menangani permintaan tambah, edit, atau hapus data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete_id'])) {
        // Hapus data
        $delete_id = $_POST['delete_id'];
        if (is_numeric($delete_id)) {
            $sql = "DELETE FROM geosehat WHERE ID = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $delete_id);
            $stmt->execute();

            echo $stmt->affected_rows > 0 ? 'Data berhasil dihapus.' : 'Gagal menghapus data.';
            $stmt->close();
        } else {
            echo 'ID tidak valid.';
        }
        exit;
    }

    // Tambah atau Edit data
    $id = isset($_POST['id']) ? $_POST['id'] : null;
    $jenis_sarana = $_POST['jenis_sarana'];
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];

    if ($id) {
        // Edit data
        $sql = "UPDATE geosehat SET jenis_sarana = ?, latitude = ?, longitude = ? WHERE ID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sddi', $jenis_sarana, $latitude, $longitude, $id);
        $stmt->execute();
        echo $stmt->affected_rows > 0 ? 'Data berhasil diperbarui.' : 'Gagal memperbarui data.';
    } else {
        // Tambah data
        $sql = "INSERT INTO geosehat (jenis_sarana, latitude, longitude) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sdd', $jenis_sarana, $latitude, $longitude);
        $stmt->execute();
        echo $stmt->affected_rows > 0 ? 'Data berhasil ditambahkan.' : 'Gagal menambahkan data.';
    }
    $stmt->close();
    exit;
}

// Menampilkan data
$sql = "SELECT ID, jenis_sarana, latitude, longitude FROM geosehat";
$result = $conn->query($sql);

$data = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

if (isset($_GET['format']) && $_GET['format'] === 'json') {
    header('Content-Type: application/json');
    echo json_encode($data);
} else {
    echo "<table class='table'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Jenis Fasilitas</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>";
    foreach ($data as $row) {
        echo "<tr data-id='{$row['ID']}'>
                <td>{$row['ID']}</td>
                <td>{$row['jenis_sarana']}</td>
                <td>{$row['latitude']}</td>
                <td>{$row['longitude']}</td>
                <td>
                    <button class='btn btn-warning btn-edit'>Edit</button>
                    <button class='btn btn-danger btn-delete'>Hapus</button>
                </td>
              </tr>";
    }
    echo "</tbody></table>";
}

$conn->close();
?>
