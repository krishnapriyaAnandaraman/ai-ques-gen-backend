#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { QuestionGeneratorApiStack } from '../lib/questions-generator-api-stack';

const app = new cdk.App();

new QuestionGeneratorApiStack(app, 'QuestionGeneratorApiStack', {});