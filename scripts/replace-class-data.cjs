const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const TARGET_CLASS = {
  id: "7a",
  name: "7А",
  teacher: null,
}

const STUDENTS = [
  { lastName: "Беляков", firstName: "Иван" },
  { lastName: "Вараксин", firstName: "Артём" },
  { lastName: "Гавриков", firstName: "Борис" },
  { lastName: "Гаркушова", firstName: "Карина" },
  { lastName: "Еременко", firstName: "Арсений" },
  { lastName: "Иноземцев", firstName: "Тимур" },
  { lastName: "Карагедов", firstName: "Кирилл" },
  { lastName: "Коробко", firstName: "Алексей" },
  { lastName: "Лободинов", firstName: "Алексей" },
  { lastName: "Малахова", firstName: "Александра" },
  { lastName: "Мовчанюк", firstName: "Дмитрий" },
  { lastName: "Музыченко", firstName: "Евгения" },
  { lastName: "Никишин", firstName: "Сергей" },
  { lastName: "Перетрухин", firstName: "Кирилл" },
  { lastName: "Петроченко", firstName: "Никита" },
  { lastName: "Петрушина", firstName: "Мария" },
  { lastName: "Пигулевский", firstName: "Даниил" },
  { lastName: "Солдатова", firstName: "Виктория" },
  { lastName: "Сухова", firstName: "Виолетта" },
  { lastName: "Ткаченко", firstName: "Денис" },
  { lastName: "Ткаченко", firstName: "Степан" },
  { lastName: "Трусова", firstName: "Ева" },
  { lastName: "Трушкин", firstName: "Сергей" },
  { lastName: "Тураченко", firstName: "Кирилл" },
  { lastName: "Устюжанинов", firstName: "Максим" },
  { lastName: "Ханунова", firstName: "София" },
  { lastName: "Чабанюк", firstName: "Варвара" },
  { lastName: "Шилов", firstName: "Любомир" },
  { lastName: "Шмерчук", firstName: "Мария" },
  { lastName: "Ярыгин", firstName: "Ярослав" },
]

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.response.deleteMany()
    await tx.testSession.deleteMany()
    await tx.student.deleteMany()
    await tx.class.deleteMany()

    await tx.class.create({
      data: {
        ...TARGET_CLASS,
        students: {
          create: STUDENTS,
        },
      },
    })
  })

  const created = await prisma.class.findUnique({
    where: { id: TARGET_CLASS.id },
    include: {
      students: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
  })

  console.log(
    JSON.stringify(
      {
        class: created?.name,
        teacher: created?.teacher,
        studentCount: created?.students.length ?? 0,
        students: created?.students.map((student) => `${student.lastName} ${student.firstName}`) ?? [],
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
