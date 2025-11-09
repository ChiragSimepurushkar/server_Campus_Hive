import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import sendEmailFun from '../config/sendEmail.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import generatedRefreshToken from '../utils/generatedRefreshToken.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true,
});

export async function registerUserController(request, response) {
    try {
        let user;
        const {
            name,
            email,
            password,
            college,
            college_branch,
            graduation_year
        } = request.body;

        // --- 1. Validate ALL required fields for Campus Hive ---
        if (!name || !email || !password || !college || !college_branch || !graduation_year) {
            return response.status(400).json({
                message: "Please provide name, email, password, college, branch, and graduation year.",
                error: true,
                success: false
            });
        }

        user = await UserModel.findOne({ email: email });
        if (user) {
            return response.status(409).json({ // Use 409 Conflict for existing resource
                message: "User already registered with this email.",
                error: true,
                success: false
            });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // --- 2. Create user with NEW academic fields ---
        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            college: college,
            college_branch: college_branch,
            graduation_year: graduation_year,
            otp: verifyCode,
            otpExpires: Date.now() + 600000 // 10 minutes
        });

        await user.save();

        // --- 3. Update Email Subject for Branding ---
        const emailResult = await sendEmailFun(
            email,
            "Verify your email for Campus Hive", // Updated Subject
            "",
            VerificationEmail(name, verifyCode)
        );
        console.log('emailResult:', emailResult);
        // Create a JWT token for verification/session continuity
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            { expiresIn: '1h' } // Short expiry for verification token
        );

        return response.status(201).json({ // Use 201 Created
            success: true,
            error: false,
            message: "User registered successfully! Please verify your email.",
            token: token,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function verifyEmailController(req, res) {
  try {
    const { email, otp } = req.body;

    // 1️⃣ Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email and OTP are required.",
      });
    }

    // 2️⃣ Find user and explicitly include otp fields
    const user = await UserModel.findOne({ email }).select("+otp +otpExpires");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found.",
      });
    }

    // 3️⃣ Check if OTP exists in DB
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "No OTP found. Please request a new one.",
      });
    }

    // 4️⃣ Convert expiration to timestamp for consistent comparison
    const otpExpiresTime = new Date(user.otpExpires).getTime();
    const now = Date.now();

    if (isNaN(otpExpiresTime) || otpExpiresTime < now) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP expired. Please request a new one.",
      });
    }

    // 5️⃣ Check OTP match (convert both to string for consistency)
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid OTP. Please try again.",
      });
    }

    // 6️⃣ Mark user verified and clear OTP
    user.verify_email = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 7️⃣ Send success response
    return res.status(200).json({
      success: true,
      error: false,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("verifyEmailController error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error.",
    });
  }
}


export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Provide email and password",
        error: true,
        success: false
      });
    }

    // IMPORTANT: select password explicitly if schema uses select: false
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return response.status(400).json({
        message: "User not registered",
        error: true,
        success: false
      });
    }

    if (user.status !== "Active") {
      return response.status(400).json({
        message: "Contact to admin",
        error: true,
        success: false
      });
    }

    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Your Email is not verified yet! Please Verify Your email",
        error: true,
        success: false
      });
    }

    // Now user.password will be defined
    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message: "Check your password",
        error: true,
        success: false
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    response.cookie('accessToken', accessToken, cookiesOption);
    response.cookie('refreshToken', refreshToken, cookiesOption);

    return response.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error("loginUserController error:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}


export async function logoutController(request, response) {
    try {
        const userId = request.userId; // auth middleware

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };

        // 1. Clear Cookies on the Client Side
        response.clearCookie("accessToken", cookiesOption);
        response.clearCookie("refreshToken", cookiesOption);

        // 2. Clear Token in the Database
        const removeRefreshToken = await UserModel.findByIdAndUpdate(userId, {
            refresh_token: ""
        });

        // 3. Send Final Success Response
        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        });
    } catch (error) {
        // 4. Handle Errors
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
    try {
        imagesArr = [];

        const userId = request.userId;
        const image = request.files;

        const user = await UserModel.findOne({ _id: userId });
        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            });
        }
        //first remove old img from cloudinary
        if (user.avatar && user.avatar.includes("cloudinary")) {
            const imgUrl = user.avatar;
            const urlArr = imgUrl.split("/");
            const avatar_image = urlArr[urlArr.length - 1];
            const imageName = avatar_image.split(".")[0];

            await cloudinary.uploader.destroy(imageName);
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < request?.files?.length; i++) {

            const img = await cloudinary.uploader.upload(
                request.files[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        user.avatar = imagesArr[0];
        await user.save();

        return response.status(200).json({
            _id: userId,
            avtar: imagesArr[0]
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
            // console.log(error, res)
        }
    );

    if (res) {
        response.status(200).send(res);
    }
}

// update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId; // auth middleware
        const {
            name,
            email,
            mobile,
            password,
            bio,
            college,
            college_branch,
            graduation_year,
            skills,
            interests,
            github_url,
            linkedin_url,
            portfolio_url
        } = request.body;

        const userExist = await UserModel.findById(userId).select('+password'); // Select password for hash comparison

        if (!userExist) {
            return response.status(404).json({ error: true, success: false, message: 'User not found!' });
        }

        let verifyCode = "";
        let hashPassword = userExist.password; // Default to existing password hash

        // 1. Handle Email Change (Requires Re-verification)
        if (email && email !== userExist.email) {
            verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Check if the new email is already in use by another user
            const emailInUse = await UserModel.findOne({ email: email, _id: { $ne: userId } });
            if (emailInUse) {
                return response.status(409).json({ error: true, success: false, message: "This new email is already registered." });
            }
        }

        // 2. Handle Password Change
        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        }

        // 3. Prepare Update Object
        const updateData = {
            name: name || userExist.name,
            mobile: mobile,
            bio: bio,
            college: college || userExist.college,
            college_branch: college_branch || userExist.college_branch,
            graduation_year: graduation_year || userExist.graduation_year,
            skills: skills || userExist.skills,
            interests: interests || userExist.interests,

            // External Links (can be updated individually or as an object)
            external_links: {
                github: github_url || userExist.external_links?.github,
                linkedin: linkedin_url || userExist.external_links?.linkedin,
                portfolio: portfolio_url || userExist.external_links?.portfolio,
            },

            // Authentication & Verification Logic
            email: email || userExist.email,
            verify_email: (email && email !== userExist.email) ? false : userExist.verify_email,
            password: hashPassword,
            otp: verifyCode || null,
            otpExpires: verifyCode ? Date.now() + 600000 : null,
        };

        const updateUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

        // 4. Send Verification Email if email was changed
        if (email && email !== userExist.email) {
            await sendEmailFun(
                email,
                "Verify your NEW email for Campus Hive",
                "",
                VerificationEmail(updateUser.name, verifyCode)
            );
        }

        // 5. Success Response (Excluding sensitive fields)
        const updatedUser = await UserModel.findById(userId).select('-password -refresh_token -otp -otpExpires');

        return response.json({
            message: "User Profile Updated successfully",
            error: false,
            success: true,
            user: updatedUser
        });
    } catch (error) {
        // Handle unique constraint violation for email update gracefully
        if (error.code === 11000) {
            return response.status(409).json({
                message: "The email address you entered is already in use.",
                error: true,
                success: false
            });
        }
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
// forgot password
export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = verifyCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes as Date object
    await user.save();

    await sendEmailFun(
      user.email,
      "Verify OTP from Campus Hive",
      "",
      VerificationEmail(user.name, verifyCode)
    );

    return response.json({
      message: "Check your email for OTP",
      error: false,
      success: true
    });

  } catch (error) {
    console.error("forgotPasswordController error:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}


export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required fields email and otp.",
        error: true,
        success: false
      });
    }

    // select otp fields explicitly
    const user = await UserModel.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false
      });
    }

    if (!user.otp) {
      return response.status(400).json({
        message: "No OTP found. Please request a new one.",
        error: true,
        success: false
      });
    }

    // Normalize expiry to timestamp
    const otpExpiresTs = user.otpExpires instanceof Date
      ? user.otpExpires.getTime()
      : Number(user.otpExpires);

    if (!otpExpiresTs || isNaN(otpExpiresTs) || otpExpiresTs < Date.now()) {
      return response.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false
      });
    }

    if (String(otp) !== String(user.otp)) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false
      });
    }

    // success: clear OTP and allow next step (e.g., reset password)
    user.otp = "";
    user.otpExpires = "";
    await user.save();

    return response.status(200).json({
      message: "OTP Verified Successfully!!",
      error: false,
      success: true
    });

  } catch (error) {
    console.error("verifyForgotPasswordOtp error:", error);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
}


// reset password
export async function resetPassword(request, response) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = request.body;

        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "provide required fields email, newPassword, confirmPassword",
                error: true,
                success: false
            });
        }
        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            });
        }
        if (oldPassword) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) {
                return response.status(400).json({
                    message: "Your Old Password is Wrong",
                    error: true,
                    success: false,
                });
            }
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            });
        }
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


// refresh token controller
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]; // Bearer token

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            });
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            });
        }

        const userId = verifyToken?.id; // Note: Payload ID is usually 'id', not '_id' unless mapped manually
        const newAccessToken = await generatedAccessToken(userId);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };

        response.cookie('accessToken', newAccessToken, cookiesOption);
        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// get-login-user-details
export async function userDetails(request, response) {
    try {
        const userId = request.userId; // Retrieved from the 'auth' middleware

        const user = await UserModel.findById(userId)
            .select('-password -refresh_token -access_token -otp -otpExpires') // Select necessary fields to exclude
            .populate({
                path: 'posted_projects',
                select: 'title description tags upvote_count', // Only fetch necessary project details
                model: 'Project'
            })
            .populate({
                path: 'joined_teams',
                select: 'title description tags owner_id',
                model: 'Project'
            });

        if (!user) {
            return response.status(404).json({
                message: "User not found.",
                error: true,
                success: false
            });
        }

        return response.json({
            message: 'User details fetched successfully',
            data: user,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || "Error fetching user details",
            error: true,
            success: false
        });
    }
}
export async function resendOtpController(req, res) {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Email is required.",
      });
    }

    // 2️⃣ Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found.",
      });
    }

    // 3️⃣ Generate new OTP and set new expiry
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = verifyCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
    await user.save();

    // 4️⃣ Send OTP email
    const emailResult = await sendEmailFun(
      email,
      "Your new Campus Hive verification code",
      "",
      VerificationEmail(user.name || "User", verifyCode)
    );

    // 5️⃣ Handle email sending errors
    if (!emailResult || emailResult.success === false) {
      return res.status(500).json({
        success: false,
        error: true,
        message: "Failed to send OTP email. Please try again later.",
      });
    }

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      error: false,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("resendOtpController error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error.",
    });
  }
}
