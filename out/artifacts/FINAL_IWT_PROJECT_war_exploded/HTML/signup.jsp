<%@ page contentType="text/html;charset=UTF-8" language="java"
         import="com.tripboss.utils.DBConnection, java.sql.*, java.security.MessageDigest, java.nio.charset.StandardCharsets" %>
<%
    String message = null;
    boolean success = false;

    if ("POST".equalsIgnoreCase(request.getMethod())) {
        request.setCharacterEncoding("UTF-8");

        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String mobile = request.getParameter("mobile");
        String password = request.getParameter("password");
        String confirm = request.getParameter("confirm_password");

        if (name == null || email == null || mobile == null || password == null || confirm == null ||
                name.isBlank() || email.isBlank() || mobile.isBlank() || password.isBlank()) {
            message = "Please fill all fields correctly.";
        } else if (!password.equals(confirm)) {
            message = "Passwords do not match.";
        } else {
            String hashed;
            try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                byte[] hashedBytes = md.digest(password.getBytes(StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                for (byte b : hashedBytes) {
                    sb.append(String.format("%02x", b));
                }
                hashed = sb.toString();
            } catch (Exception ex) {
                message = "Server error hashing password.";
                hashed = null;
            }

            if (hashed != null) {
                String sql = "INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)";
                try (Connection conn = DBConnection.getConnection();
                     PreparedStatement ps = conn.prepareStatement(sql)) {

                    ps.setString(1, name.trim());
                    ps.setString(2, email.trim());
                    ps.setString(3, mobile.trim());
                    ps.setString(4, hashed);

                    int inserted = ps.executeUpdate();
                    if (inserted > 0) {
                        success = true;
                        message = "Account created.";
                    } else {
                        message = "Could not create account.";
                    }
                } catch (SQLException ex) {
                    if (ex.getErrorCode() == 1062) {
                        message = "Email or unique field already exists.";
                    } else {
                        message = "Database error: " + ex.getMessage();
                    }
                }
            }
        }
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TripBoss | Sign Up</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { margin:0; font-family: 'Poppins', sans-serif; background:#111; color:white; display:flex; align-items:center; justify-content:center; height:100vh; }
        .container { width:420px; padding:35px 40px; border-radius:24px; background:rgba(255,255,255,0.06); text-align:center; }
        .input-box { margin-top:15px; }
        .input-box input { width:100%; padding:14px; border-radius:14px; background:rgba(255,255,255,0.08); color:white; border:1px solid rgba(255,255,255,0.14); }
        .pwd-criteria { text-align:left; margin-top:10px; background:rgba(0,0,0,0.18); padding:12px; border-radius:12px; color:#e6e6e6; }
        .pwd-criteria li { margin:6px 0; opacity:0.75; }
        .pwd-criteria li.valid { color:#12ef67; opacity:1; }
        .pwd-criteria li .dot { width:10px; height:10px; border-radius:50%; background:#ff7675; display:inline-block; margin-right:8px; }
        .btn { width:100%; padding:14px; margin-top:20px; border-radius:30px; background:#12ef67; color:#000; border:none; font-weight:700; cursor:pointer; }
        .msg { margin-top:12px; font-weight:600; padding:8px; border-radius:8px; }
    </style>
</head>
<body>
<div class="container">
    <h2>Create Account</h2>
    <p>Already have an account? <a href="login.html">Login</a></p>

    <form id="signup-form" method="post" action="signup.jsp" novalidate>
        <div class="input-box">
            <input id="name" name="name" type="text" placeholder="Full Name" required>
        </div>

        <div class="input-box">
            <input id="email" name="email" type="email" placeholder="Email Address" required>
        </div>

        <div class="input-box">
            <input id="mobile" name="mobile" type="tel" placeholder="Mobile Number" pattern="[0-9+ ]{6,}" required>
        </div>

        <div class="input-box">
            <input id="password" name="password" type="password" placeholder="Password" required>
        </div>

        <div class="pwd-criteria" id="pwd-criteria">
            <strong style="display:block; margin-bottom:8px;">Password must contain:</strong>
            <ul>
                <li id="c-length"><span class="dot"></span>At least 8 characters</li>
                <li id="c-lower"><span class="dot"></span>Lowercase letter (a-z)</li>
                <li id="c-upper"><span class="dot"></span>Uppercase letter (A-Z)</li>
                <li id="c-number"><span class="dot"></span>Number (0-9)</li>
                <li id="c-special"><span class="dot"></span>Special character (e.g. !@#$%)</li>
            </ul>
        </div>

        <div class="input-box">
            <input id="confirm_password" name="confirm_password" type="password" placeholder="Retype Password" required>
        </div>

        <div id="msg" class="msg" aria-live="polite"
             style="<%= success ? "color:#001f0f;background:rgba(18,239,103,0.95);" : "color:#ff7675;background:transparent;" %>">
            <%= message == null ? "" : message %>
        </div>

        <button id="signup-btn" class="btn" type="submit">Sign Up</button>
    </form>

    <p style="margin-top:12px;"><a href="../index.html">⬅ Back to Home</a></p>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('signup-form');
        const pwd = document.getElementById('password');
        const cpwd = document.getElementById('confirm_password');
        const msg = document.getElementById('msg');
        const signupBtn = document.getElementById('signup-btn');

        const checks = {
            length: document.getElementById('c-length'),
            lower: document.getElementById('c-lower'),
            upper: document.getElementById('c-upper'),
            number: document.getElementById('c-number'),
            special: document.getElementById('c-special')
        };

        function validatePasswordCriteria(value) {
            return {
                length: value.length >= 8,
                lower: /[a-z]/.test(value),
                upper: /[A-Z]/.test(value),
                number: /[0-9]/.test(value),
                special: /[!@#$%^&*(),.?":{}|<>\[\]\\/\\~`_+=;:-]/.test(value)
            };
        }

        function updateCriteriaUI(results) {
            for (const key in results) {
                const el = checks[key];
                if (!el) continue;
                if (results[key]) {
                    el.classList.add('valid');
                } else {
                    el.classList.remove('valid');
                }
            }
        }

        function allCriteriaMet(results) {
            return Object.values(results).every(v => v === true);
        }

        function updateSignupState() {
            const results = validatePasswordCriteria(pwd.value);
            const match = pwd.value && pwd.value === cpwd.value;
            updateCriteriaUI(results);

            signupBtn.disabled = !(allCriteriaMet(results) && match);
        }

        pwd.addEventListener('input', updateSignupState);
        cpwd.addEventListener('input', updateSignupState);

        form.addEventListener('submit', function (e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                msg.style.color = '#ff7675';
                msg.style.background = 'transparent';
                msg.textContent = 'Please fill all fields correctly.';
                return;
            }

            const results = validatePasswordCriteria(pwd.value);
            if (!allCriteriaMet(results)) {
                e.preventDefault();
                msg.style.color = '#ff7675';
                msg.style.background = 'transparent';
                msg.textContent = 'Password does not meet the criteria.';
                pwd.focus();
                return;
            }

            if (pwd.value !== cpwd.value) {
                e.preventDefault();
                msg.style.color = '#ff7675';
                msg.style.background = 'transparent';
                msg.textContent = 'Passwords do not match.';
                cpwd.focus();
                return;
            }
            // allow normal submission
        });
    });
</script>
</body>
</html>
