    </div>
    <footer style="background: #008000; color: white; text-align: center; padding: 2rem; margin-top: 3rem;">
        <p>&copy; 2025 GNUTS - Ghana National Union of Technical Students | All Rights Reserved</p>
        <p>Green | Gold | White - Unity, Excellence, Advocacy</p>
    </footer>
    <script>
        // Mobile menu toggle
        document.addEventListener('DOMContentLoaded', function() {
            // Smooth scrolling
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
                });
            });
            
            // Active nav highlight
            const current = location.pathname.split('/').pop() || 'index.php';
            document.querySelectorAll('.nav a').forEach(a => {
                if (a.getAttribute('href') === current) a.style.color = '#FFD700';
            });
        });
    </script>
</body>
</html>

