export default async function handler(req, res) {
  try {
    const userid = req.query.id;
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error fetching user",
    });
  }
}
