const Equipment = require('./models/Equipment');
const { handleStatusChange } = require('./controllers/equipmentController');

const startScheduler = () => {
    console.log('⏰ Equipment Scheduler started...');

    // Run every minute
    setInterval(async () => {
        try {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                now.getMinutes().toString().padStart(2, '0');

            // Find enabled schedules matching current time
            const scheduledEquipment = await Equipment.find({
                'schedule.enabled': true,
                'schedule.time': currentTime
            });

            if (scheduledEquipment.length > 0) {
                console.log(`🎯 Found ${scheduledEquipment.length} scheduled tasks for ${currentTime}`);

                for (const eq of scheduledEquipment) {
                    // Turn equipment ON and track usage
                    await handleStatusChange(eq.id, true);

                    // Disable schedule after execution
                    await Equipment.findOneAndUpdate(
                        { id: eq.id },
                        { $set: { 'schedule.enabled': false } }
                    );

                    console.log(`✅ [Schedule] ${eq.name} turned ON and usage tracking started.`);
                }
            }
        } catch (error) {
            console.error('❌ Scheduler Error:', error);
        }
    }, 60000); // Check every 60 seconds
};

module.exports = { startScheduler };
