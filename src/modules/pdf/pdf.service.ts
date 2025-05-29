import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Admin } from '../admin/entities/admin.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Lead } from '../lead/entities/lead.entity';

@Injectable()
export class PdfService {
  async generatePdf(data: {
    admins?: Admin[];
    users?: User[];
    courses?: Course[];
    title?: string;
    leads?: Lead[];
  }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: any[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // PDF sarlavhasi
      const title = data.title || "Ma'lumotlar hisoboti";
      doc.fontSize(25).text(title, { align: 'center' });
      doc.moveDown();

      // Adminlar bo'limi
      if (data.admins && data.admins.length > 0) {
        this.addSection(doc, 'Adminlar', data.admins, (admin) => [
          `ID: ${admin.id}`,
          `Username: ${admin.username}`,
          `Yaratilgan sana: ${admin.createdAt.toLocaleDateString()}`,
        ]);
      }

      if (data.leads && data.leads.length > 0) {
        this.addSection(doc, 'Leadlar', data.leads, (lead) => [
          `ID: ${lead.id}`,
          `Ism: ${lead.fullName}`,
          `Telefon: ${lead.phoneNumber}`,
          `Kasb: ${lead.job || 'Belgilanmagan'}`,
          `Lavozim: ${lead.position || 'Belgilanmagan'}`,
          `Ishchilari: ${lead.employers || 'Belgilanmagan'}`,
          `Kurs: ${lead.course.name || 'Belgilanmagan'}`,
          `Hudud: ${lead.region || 'Belgilanmagan'}`,
          `Shahar: ${lead.city || 'Belgilanmagan'}`,
          `Yaratilgan sana: ${lead.createdAt.toLocaleDateString()}`,
        ]);
      }

      // Userlar bo'limi
      if (data.users && data.users.length > 0) {
        this.addSection(doc, 'Foydalanuvchilar', data.users, (user) => [
          `ID: ${user.id}`,
          `Ism: ${user.fullName}`,
          `Telefon: ${user.phoneNumber}`,
          `Yaratilgan sana: ${user.createdAt.toLocaleDateString()}`,
        ]);
      }

      // Kurslar bo'limi
      if (data.courses && data.courses.length > 0) {
        this.addSection(doc, 'Kurslar', data.courses, (course) => {
          // Sanalarni formatlash
          const formatDate = (date: Date) =>
            date ? new Date(date).toLocaleDateString() : 'Belgilanmagan';

          // Tavsifni xavfsiz olish
          const safeDescription = course.description
            ? course.description.length > 50
              ? course.description.substring(0, 50) + '...'
              : course.description
            : 'Tavsif mavjud emas';

          return [
            `ID: ${course.id}`,
            `Nomi: ${course.name}`,
            `Boshlanish sanasi: ${formatDate(course.start_date)}`,
            `Tugash sanasi: ${formatDate(course.end_date)}`,
            `Manzil: ${course.location || 'Belgilanmagan'}`,
            `Vaqt: ${course.time || 'Belgilanmagan'}`,
            `Holati: ${course.status || 'Belgilanmagan'}`,
            `Foydalanuvchilar soni: ${course.users}`, // Agar users number bo'lsa
            `Tavsif: ${safeDescription}`,
            `Yaratilgan sana: ${formatDate(course.createdAt)}`,
          ];
        });
      }

      doc.end();
    });
  }

  private addSection<T>(
    doc: PDFDocument,
    sectionTitle: string,
    items: T[],
    itemMapper: (item: T) => string[],
  ) {
    doc.fontSize(18).text(sectionTitle, { underline: true });
    doc.moveDown(0.5);

    items.forEach((item, index) => {
      doc
        .fontSize(14)
        .text(
          `${index + 1}. ${sectionTitle.substring(0, sectionTitle.length - 1)} ma'lumoti`,
          { underline: true },
        );

      const itemData = itemMapper(item);
      itemData.forEach((line) => {
        doc.fontSize(12).text(line);
      });

      doc.moveDown();
    });

    doc.addPage(); // Har bir bo'lim yangi sahifada
  }
}
