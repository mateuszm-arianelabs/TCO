export async function benchmark<T extends () => Promise<void>, K>(fn: T): Promise<void> {
    const start = new Date();
    await fn();
    const end = new Date();

    const timeMs = end.getTime() - start.getTime();

    console.log(`\n====Total time elapsed - ${timeMs}ms====`)
}