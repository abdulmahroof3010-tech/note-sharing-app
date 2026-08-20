const attempts = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const rateLimitMiddleware = async (c, next) => {
    const token = c.req.param("token");

    const forwardedFor = c.req.header("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

    const key = `${ip}:${token}`;

    const now = Date.now();

    const record = attempts.get(key);

    if (!record || now - record.firstAttempt >= WINDOW_MS) {
        attempts.set(key, {
            count: 1,
            firstAttempt: now,
        });

        await next();
        return;
    }

    if (record.count >= MAX_ATTEMPTS) {
        const retryAfter = Math.ceil(
            (WINDOW_MS - (now - record.firstAttempt)) / 1000
        );

        c.header("Retry-After", String(retryAfter));

        return c.json(
            {
                message: "Too many attempts. Please try again later.",
            },
            429
        );
    }

    record.count += 1;

    await next();
};