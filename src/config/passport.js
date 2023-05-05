// Thiết lập cấu hình Passport
passport.use(
    new GoogleStrategy(
        {
            clientID:
                '156152087575-3vuqpm4k388j6vj1dcb40ai1228ucck4.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/',
        },
        function (accessToken, refreshToken, profile, done) {},
    ),
);
