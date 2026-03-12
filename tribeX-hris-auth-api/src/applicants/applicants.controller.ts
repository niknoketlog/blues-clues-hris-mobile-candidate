// src/applicants/applicants.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantLoginDto } from './dto/applicant-login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Applicants')
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  // PUBLIC route — no JwtAuthGuard, applicants don't have tokens yet.
  // Still guarded by ThrottlerGuard to prevent signup abuse.
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Applicant self-registration via Career Portal' })
  register(@Body() dto: CreateApplicantDto) {
    return this.applicantsService.register(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Applicant login via Career Portal' })
  login(@Body() dto: ApplicantLoginDto) {
    return this.applicantsService.login(dto);
  }

  // PUBLIC route — called when applicant clicks the verification link in their email.
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify applicant email address via token' })
  verifyEmail(@Query('token') token: string) {
    return this.applicantsService.verifyEmail(token);
  }
}
