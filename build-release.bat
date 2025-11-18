@echo off
echo ====================================
echo Building Docfast Toolkit for Release
echo ====================================
echo.

echo [1/4] Compiling SCSS to CSS...
call npx sass sass:css
if %errorlevel% neq 0 (
    echo ERROR: SCSS compilation failed
    exit /b 1
)
echo ✓ CSS compiled successfully
echo.

echo [2/4] Building JavaScript bundles with Webpack...
call npx webpack --config webpack.config.js
if %errorlevel% neq 0 (
    echo ERROR: Webpack build failed
    exit /b 1
)
echo ✓ JavaScript bundles built successfully
echo.

echo [3/4] Copying compiled files to chrome folder...
xcopy /Y css\*.css chrome\css\
xcopy /Y css\*.css.map chrome\css\
xcopy /Y dist\*.js chrome\dist\
xcopy /Y dist\*.js.map chrome\dist\
copy /Y manifests\manifest-chrome.json chrome\manifest.json
copy /Y manifests\schema-chrome.json chrome\schema.json
echo ✓ Files copied to chrome folder
echo.

echo [4/4] Updating release folder...
xcopy /Y /E chrome\dist\*.* release\dist\
xcopy /Y /E chrome\css\*.* release\css\
xcopy /Y chrome\manifest.json release\
xcopy /Y /E chrome\_locales\*.* release\_locales\
xcopy /Y /E chrome\images\*.* release\images\
xcopy /Y /E chrome\view\*.* release\view\
copy /Y clear-setup.html chrome\view\
copy /Y clear-setup.html release\view\
xcopy /Y chrome\LICENSE release\
xcopy /Y chrome\schema.json release\
echo ✓ Release folder updated successfully
echo.

echo ====================================
echo Build completed successfully!
echo Release folder is ready at: release\
echo ====================================
